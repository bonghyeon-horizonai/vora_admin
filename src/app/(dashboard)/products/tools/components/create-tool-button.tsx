'use client';

import { Button } from '@mui/material';
import Link from 'next/link';
import NiPlusIcon from '@/icons/nexture/ni-plus';

import { useTranslations } from 'next-intl';

export default function CreateToolButton() {
    const t = useTranslations('dashboard');

    return (
        <Button
            component={Link}
            href="/products/tools/new"
            variant="contained"
            startIcon={<NiPlusIcon />}
        >
            {t('tools-create-button')}
        </Button>
    );
}
