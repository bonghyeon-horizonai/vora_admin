"use client";

import { Box, Typography } from "@mui/material";

import { ProductWithDetails } from "../types";

interface ProductFormProps {
    product: ProductWithDetails | null;
    isNew: boolean;
}

export default function ProductForm({ product, isNew }: ProductFormProps) {
    return (
        <Box>
            <Typography variant="h6">Product Form ({isNew ? "New" : "Edit"})</Typography>
            <Typography variant="body2" color="text.secondary">
                {product ? `Editing product: ${product.id}` : "Creating new product"}
            </Typography>
        </Box>
    );
}
