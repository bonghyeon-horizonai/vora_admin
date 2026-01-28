'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type Resolver, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    Stack,
    Tabs,
    Tab,
    Typography,
    Alert,
    Autocomplete,
    IconButton,
    Paper,
    Divider,
} from '@mui/material';
import { cn } from '@/lib/utils';
import type { ProductWithDetails, LanguageCode } from '@/features/admin/products/types';
import { createProductSchema, type CreateProductSchema } from '@/features/admin/products/schema';
import { createProductAction, updateProductAction, searchToolsAction } from '@/features/admin/products/actions';
import NiTrashIcon from '@/icons/nexture/ni-bin-empty';
import NiDragIcon from '@/icons/nexture/ni-drag-vertical';
import { useTranslations } from 'next-intl';

interface ProductFormProps {
    product: ProductWithDetails | null;
    isNew: boolean;
}

const LANGUAGES: { code: LanguageCode; label: string; currency: 'KRW' | 'USD' | 'JPY' }[] = [
    { code: 'KR', label: '한국어', currency: 'KRW' },
    { code: 'EN', label: 'English', currency: 'USD' },
    { code: 'JP', label: '日本語', currency: 'JPY' },
];

export default function ProductForm({ product, isNew }: ProductFormProps) {
    const t = useTranslations('dashboard');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [mainTab, setMainTab] = useState(0); // 0: Basic, 1: Detail/Assets
    const [langTab, setLangTab] = useState(0);

    const [toolSearchQuery, setToolSearchQuery] = useState('');
    const [toolSearchResults, setToolSearchResults] = useState<{ id: string; toolCode: string; name: string }[]>([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const results = await searchToolsAction(toolSearchQuery);
            setToolSearchResults(results);
        }, 300);
        return () => clearTimeout(timer);
    }, [toolSearchQuery]);

    const defaultValues: CreateProductSchema = {
        type: product?.type || 'SUBSCRIPTION',
        category: product?.category || 'GENERAL',
        billingCycle: (product?.billingCycle as 'MONTHLY' | 'YEARLY' | 'ONCE') || 'MONTHLY',
        productCode: product?.productCode || '',
        paddleProductId: product?.paddleProductId || '',
        paddlePriceId: product?.paddlePriceId || '',
        iconImageUrl: product?.iconImageUrl || '',
        isActive: product?.isActive ?? true,
        i18n: LANGUAGES.map((lang) => {
            const existing = product?.i18n.find((i) => i.languageCode === lang.code);
            return {
                languageCode: lang.code,
                name: existing?.name || '',
                description: existing?.description || '',
                currencyCode: lang.currency,
                price: existing?.price || '0',
                currentPrice: existing?.currentPrice || '0',
            };
        }),
        tools: product?.tools.map(t => ({
            toolId: t.toolId,
            quotaAllocation: t.quotaAllocation,
            sortOrder: t.sortOrder,
        })) || [],
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateProductSchema>({
        resolver: zodResolver(createProductSchema) as unknown as Resolver<CreateProductSchema>,
        defaultValues,
    });

    const { fields: toolFields, append: appendTool, remove: removeTool } = useFieldArray({
        control,
        name: 'tools',
    });

    const watchedTools = watch('tools');

    const onSubmit = (data: CreateProductSchema) => {
        setError(null);
        startTransition(async () => {
            const result = isNew
                ? await createProductAction(data)
                : await updateProductAction(product!.id, { ...data, id: product!.id });

            if (result.success) {
                router.push('/products/list');
                router.refresh();
            } else {
                setError(result.error);
            }
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Tabs
                value={mainTab}
                onChange={(_, v) => setMainTab(v)}
                sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label={t('products-form-tab-basic')} />
                <Tab label={t('products-form-tab-detail')} />
            </Tabs>

            {/* TAB 1: BASIC INFO */}
            <Box sx={{ display: mainTab === 0 ? 'block' : 'none' }}>
                <Typography variant="h6" sx={{ mb: 3 }}>{t('products-form-tab-basic')}</Typography>

                <Grid container spacing={3}>
                    {/* Attributes */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>{t('products-form-section-type')}</InputLabel>
                                    <Select {...field} label={t('products-form-section-type')}>
                                        <MenuItem value="SUBSCRIPTION">{t('products-form-type-subscription')}</MenuItem>
                                        <MenuItem value="PURCHASE">{t('products-form-type-purchase')}</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Controller
                            name="billingCycle"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>{t('products-form-billing-cycle')}</InputLabel>
                                    <Select {...field} label={t('products-form-billing-cycle')}>
                                        <MenuItem value="MONTHLY">{t('products-period-monthly')}</MenuItem>
                                        <MenuItem value="YEARLY">{t('products-period-yearly')}</MenuItem>
                                        <MenuItem value="ONCE">{t('products-period-once')}</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label={t('products-form-category')} fullWidth value={field.value || ''} />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="productCode"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('products-form-product-code')}
                                    fullWidth
                                    required
                                    error={!!errors.productCode}
                                    helperText={errors.productCode?.message}
                                />
                            )}
                        />
                    </Grid>

                    {/* Paddle IDs */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="paddleProductId"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label={t('products-form-paddle-id')} fullWidth value={field.value || ''} />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="paddlePriceId"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label={t('products-form-paddle-price-id')} fullWidth value={field.value || ''} />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>다국어 가격 정보</Typography>
                        <Tabs
                            value={langTab}
                            onChange={(_, v) => setLangTab(v)}
                            sx={{ mb: 2 }}
                        >
                            {LANGUAGES.map((lang, idx) => (
                                <Tab key={lang.code} label={lang.label} value={idx} />
                            ))}
                        </Tabs>

                        {LANGUAGES.map((lang, idx) => (
                            <Box key={lang.code} sx={{ display: langTab === idx ? 'block' : 'none' }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Controller
                                            name={`i18n.${idx}.name`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`${t('products-col-name')} (${lang.label})`}
                                                    fullWidth
                                                    required={idx === 0}
                                                    error={!!errors.i18n?.[idx]?.name}
                                                    helperText={errors.i18n?.[idx]?.name?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Controller
                                            name={`i18n.${idx}.price`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`${t('products-form-price-krw').replace('KRW', lang.currency)}`}
                                                    fullWidth
                                                    required
                                                    type="number"
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Controller
                                            name={`i18n.${idx}.currentPrice`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="할인 가격 (Optional)"
                                                    fullWidth
                                                    type="number"
                                                    value={field.value || ''}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Grid>

                    {/* Tool Bundling */}
                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>{t('products-form-tools-title')}</Typography>

                        <Autocomplete
                            sx={{ mb: 3 }}
                            options={toolSearchResults}
                            filterOptions={(x) => x} // Disable built-in filtering since we search on server
                            getOptionLabel={(option) => `[${option.toolCode}] ${option.name || 'No Name'}`}
                            onInputChange={(_, value) => setToolSearchQuery(value)}
                            onChange={(_, value) => {
                                if (value && !watchedTools.some(t => t.toolId === value.id)) {
                                    appendTool({
                                        toolId: value.id,
                                        quotaAllocation: null,
                                        sortOrder: watchedTools.length,
                                    });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label={t('products-form-tools-search')} fullWidth />
                            )}
                        />

                        <Stack spacing={1}>
                            {toolFields.map((field, index) => {
                                // Find tool details for display
                                const toolObj = product?.tools.find(t => t.toolId === field.toolId);
                                const selectedResult = toolSearchResults.find(r => r.id === field.toolId);
                                const displayName = toolObj?.name || selectedResult?.name || 'No Name';
                                const displayCode = toolObj?.toolCode || selectedResult?.toolCode || '';

                                return (
                                    <Paper key={field.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <NiDragIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2">[{displayCode}] {displayName}</Typography>
                                        </Box>
                                        <Box sx={{ width: 150 }}>
                                            <Controller
                                                name={`tools.${index}.quotaAllocation`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        label={t('products-form-tools-quota')}
                                                        size="small"
                                                        type="number"
                                                        value={field.value === null ? '' : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <IconButton onClick={() => removeTool(index)} color="error">
                                            <NiTrashIcon />
                                        </IconButton>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* TAB 2: DETAIL & ASSETS */}
            <Box sx={{ display: mainTab === 1 ? 'block' : 'none' }}>
                <Typography variant="h6" sx={{ mb: 3 }}>{t('products-form-tab-detail')}</Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="iconImageUrl"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label={t('products-form-icon-url')} fullWidth value={field.value || ''} placeholder="https://..." />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('products-form-description')}</Typography>
                        <Tabs
                            value={langTab}
                            onChange={(_, v) => setLangTab(v)}
                            sx={{ mb: 2 }}
                        >
                            {LANGUAGES.map((lang, idx) => (
                                <Tab key={lang.code} label={lang.label} value={idx} />
                            ))}
                        </Tabs>

                        {LANGUAGES.map((lang, idx) => (
                            <Box key={lang.code} sx={{ display: langTab === idx ? 'block' : 'none' }}>
                                <Controller
                                    name={`i18n.${idx}.description`}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            multiline
                                            rows={8}
                                            placeholder={`상세 설명을 입력하세요 (${lang.label})`}
                                            value={field.value || ''}
                                        />
                                    )}
                                />
                            </Box>
                        ))}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    }
                                    label={t('products-form-is-active')}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    {t('products-form-cancel')}
                </Button>
                <Button type="submit" variant="contained" disabled={isPending}>
                    {isPending ? t('products-form-saving') : t('products-form-save')}
                </Button>
            </Stack>
        </Box>
    );
}
