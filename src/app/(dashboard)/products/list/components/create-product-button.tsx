'use client';

import { Button } from '@mui/material';
import Link from 'next/link';
import NiPlusIcon from '@/icons/nexture/ni-plus';
import { useTranslations } from 'next-intl';

export default function CreateProductButton() {
    const t = useTranslations('dashboard');

    return (
        <Button
            variant="contained"
            startIcon={<NiPlusIcon />}
            component={Link}
            href="/products/list/new"
        >
            {t('products-create-button')}
        </Button>
    );
}
