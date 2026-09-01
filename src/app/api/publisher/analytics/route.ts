// Publisher analytics API
import { NextRequest } from 'next/server';
import {
  createBookRepository,
  createPublisherRepository,
  verifyPublisherAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { AnalyticsService } from '@/classes/services/AnalyticsService';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  let publisher = await verifyPublisherAuth(req);

  if (!publisher) {
    const auth = req.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const { createAuthService } = await import('@/lib/auth');
      const authService = createAuthService();
      try {
        publisher = await authService.getPublisherFromToken(token);
      } catch {}
    }
  }

  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    // Parse period param: 7d, 30d, 6m, 1y (default 30d)
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') ?? '30d';

    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'month';

    if (period === '7d') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'day';
    } else if (period === '30d') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'day';
    } else if (period === '6m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      groupBy = 'month';
    } else {
      // 1y
      startDate = new Date(now.getFullYear(), 0, 1);
      groupBy = 'month';
    }

    const analyticsService = new AnalyticsService(
      createBookRepository(),
      createPublisherRepository(),
    );

    // Get publisher's book IDs
    const publisherBooks = await prisma.book.findMany({
      where: { publisherId: publisher.id },
      select: { id: true },
    });
    const bookIds = publisherBooks.map(b => b.id);

    // Calculate real stats from Prisma DB
    const allPublisherRatings = bookIds.length > 0
      ? await prisma.rating.findMany({ where: { bookId: { in: bookIds } }, select: { score: true } })
      : [];
    const directAvgRating = allPublisherRatings.length > 0
      ? Math.round((allPublisherRatings.reduce((s, r) => s + r.score, 0) / allPublisherRatings.length) * 10) / 10
      : 0;

    const stats = {
      totalEbooks: publisherBooks.length,
      pendingReviews: await prisma.book.count({ where: { publisherId: publisher.id, status: 'PENDING' } }),
      recentViews: bookIds.length > 0 ? await prisma.bookView.count({ where: { bookId: { in: bookIds } } }) : 0,
      averageRating: directAvgRating,
    };

    const topBooks = await analyticsService.getTopPublisherBooks(publisher.id);

    // Get real chart data from BookView
    let chartData: { label: string; views: number }[] = [];

    if (bookIds.length > 0) {
      const views = await prisma.bookView.findMany({
        where: {
          bookId: { in: bookIds },
          date: { gte: startDate, lte: now },
        },
        select: { date: true },
        orderBy: { date: 'asc' },
      });

      if (groupBy === 'day') {
        // Build map of day -> count for last N days
        const dayMap = new Map<string, number>();
        const days = period === '7d' ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
          dayMap.set(key, 0);
        }
        for (const v of views) {
          const key = v.date.toISOString().slice(0, 10);
          if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
        }
        // Format label as "DD MMM" e.g. "29 Aug"
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        chartData = Array.from(dayMap.entries()).map(([k, v]) => {
          const d = new Date(k);
          return { label: `${d.getDate()} ${months[d.getMonth()]}`, views: v };
        });
      } else {
        // Group by month
        const monthMap = new Map<string, number>();
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const totalMonths = period === '6m' ? 6 : 12;
        for (let i = totalMonths - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
          monthMap.set(key, 0);
        }
        for (const v of views) {
          const key = `${v.date.getFullYear()}-${String(v.date.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
        }
        const months2 = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        chartData = Array.from(monthMap.entries()).map(([k, count]) => {
          const [yr, mo] = k.split('-').map(Number);
          return { label: `${months2[mo - 1]} ${yr}`, views: count };
        });
      }
    } else {
      // No books — return zero-filled labels
      if (groupBy === 'day') {
        const days = period === '7d' ? 7 : 30;
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          chartData.push({ label: `${d.getDate()} ${months[d.getMonth()]}`, views: 0 });
        }
      } else {
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const totalMonths = period === '6m' ? 6 : 12;
        for (let i = totalMonths - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          chartData.push({ label: `${months[d.getMonth()]} ${d.getFullYear()}`, views: 0 });
        }
      }
    }

    // Get ratings per top book
    const topBooksWithRatings = await Promise.all(
      topBooks.map(async (book) => {
        const ratings = await prisma.rating.findMany({ where: { bookId: book.id }, select: { score: true } });
        const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;
        return { ...book, averageRating: avg };
      })
    );

    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
    const recentActivity = await prisma.book.findMany({
      where: { publisherId: publisher.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    });

    // ── Trend: current 30 days vs previous 30 days ──────────────────
    const bookIds2 = publisherBooks.map(b => b.id);
    const thirtyDaysAgo  = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo   = new Date(now); sixtyDaysAgo.setDate(now.getDate() - 60);

    const [viewsThisPeriod, viewsPrevPeriod, booksThisPeriod, booksPrevPeriod] = await Promise.all([
      // Views this 30 days
      bookIds2.length > 0 ? prisma.bookView.count({
        where: { bookId: { in: bookIds2 }, date: { gte: thirtyDaysAgo, lte: now } },
      }) : Promise.resolve(0),
      // Views previous 30 days
      bookIds2.length > 0 ? prisma.bookView.count({
        where: { bookId: { in: bookIds2 }, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }) : Promise.resolve(0),
      // Ebooks added this 30 days
      prisma.book.count({ where: { publisherId: publisher.id, createdAt: { gte: thirtyDaysAgo } } }),
      // Ebooks added previous 30 days
      prisma.book.count({ where: { publisherId: publisher.id, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    // Ratings this period vs previous
    const ratingsThisPeriod = bookIds2.length > 0 ? await prisma.rating.findMany({
      where: { bookId: { in: bookIds2 }, createdAt: { gte: thirtyDaysAgo } },
      select: { score: true },
    }) : [];
    const ratingsPrevPeriod = bookIds2.length > 0 ? await prisma.rating.findMany({
      where: { bookId: { in: bookIds2 }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      select: { score: true },
    }) : [];

    const avgRatingThis = ratingsThisPeriod.length > 0
      ? ratingsThisPeriod.reduce((s, r) => s + r.score, 0) / ratingsThisPeriod.length : null;
    const avgRatingPrev = ratingsPrevPeriod.length > 0
      ? ratingsPrevPeriod.reduce((s, r) => s + r.score, 0) / ratingsPrevPeriod.length : null;

    const calcTrend = (curr: number, prev: number): number | null => {
      if (prev === 0 && curr === 0) return null;
      if (prev === 0) return null; // Can't compute % from 0 base
      return Math.round(((curr - prev) / prev) * 100);
    };

    const trends = {
      views:  calcTrend(viewsThisPeriod, viewsPrevPeriod),
      ebooks: calcTrend(booksThisPeriod, booksPrevPeriod),
      rating: (avgRatingThis !== null && avgRatingPrev !== null)
        ? calcTrend(Math.round(avgRatingThis * 10), Math.round(avgRatingPrev * 10))
        : null,
    };

    return successResponse({ stats, topBooks: topBooksWithRatings, announcements, recentActivity, chartData, period, trends });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return errorResponse(`Failed to fetch analytics: ${error.message}`);
  }
}

