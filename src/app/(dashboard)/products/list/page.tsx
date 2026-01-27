import { Suspense } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { getProductList } from '@/features/admin/products/queries';
import ProductListTable from '../../../../features/admin/products/components/product-list-table';
import ProductListFilters from '../../../../features/admin/products/components/product-list-filters';
import CreateProductButton from '../../../../features/admin/products/components/create-product-button';
import Loading from '@/app/loading';
import { getLocale, getTranslations } from 'next-intl/server';

interface PageProps {
    searchParams: Promise<{
        search?: string;
        status?: 'all' | 'active' | 'inactive';
        page?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }>;
}

export default async function ProductsListPage({ searchParams }: PageProps) {
    const t = await getTranslations('dashboard');
    const locale = await getLocale();
    const params = await searchParams;
    const search = params.search || '';
    const status = (params.status as 'all' | 'active' | 'inactive') || 'all';
    const page = parseInt(params.page || '1', 10);
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = (params.sortOrder as 'asc' | 'desc') || 'desc';

    const { data: products, total, pageSize } = await getProductList({
        search,
        status,
        page,
        sortBy,
        sortOrder,
        locale,
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <Typography variant="h4" fontWeight="bold">
                    {t('products-list-title')}
                </Typography>
                <CreateProductButton />
            </Stack>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <ProductListFilters search={search} status={status} />
            </Paper>

            {/* Table */}
            <Paper sx={{ p: 2 }}>
                <ProductListTable
                    products={products}
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </Paper>
        </Box>
    );
}
