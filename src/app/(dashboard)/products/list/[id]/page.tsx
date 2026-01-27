import { notFound } from 'next/navigation';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { getProductById } from '@/features/admin/products/queries';
import ProductForm from '@/features/admin/products/components/product-form';
import BackButton from '@/app/(dashboard)/products/tools/components/back-button';
import { getTranslations, getLocale } from 'next-intl/server';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const t = await getTranslations('dashboard');
    const { id } = await params;
    const isNew = id === 'new';
    const locale = await getLocale();
    let product = null;
    if (!isNew) {
        product = await getProductById(id, locale);
        if (!product) {
            notFound();
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <BackButton href="/products/list" />
                <Typography variant="h4" fontWeight="bold">
                    {isNew ? t('products-form-title-new') : t('products-form-title-edit')}
                </Typography>
            </Stack>

            {/* Form */}
            <Paper sx={{ p: 3 }}>
                <ProductForm product={product} isNew={isNew} />
            </Paper>
        </Box>
    );
}
