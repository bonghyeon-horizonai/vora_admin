'use client';

import { IconButton } from '@mui/material';
import Link from 'next/link';
import NiArrowLeft from '@/icons/nexture/ni-arrow-left';

interface BackButtonProps {
    href: string;
}

export default function BackButton({ href }: BackButtonProps) {
    return (
        <IconButton component={Link} href={href}>
            <NiArrowLeft />
        </IconButton>
    );
}
