'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FAQComponent from '@/components/FAQComponent';
import VisitorNavLink from '@/components/VisitorNavLink';

export default function VisitorFAQPage() {
  return (
    <>
      {/* ---- MAIN CONTENT ---- */}
      <main>
        <FAQComponent type="visitor" />
      </main>
    </>
  );
}
