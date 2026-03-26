'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ClubIndexPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      // Redirect to chat as the default club view
      router.replace(`/clubs/${id}/chat`);
    }
  }, [id, router]);

  return null;
}
