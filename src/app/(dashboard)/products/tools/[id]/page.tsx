import BackButton from "../components/back-button";
import ToolForm from "../components/tool-form";
import { notFound } from "next/navigation";

import { Box, Paper, Stack, Typography } from "@mui/material";

import { getToolById } from "@/features/admin/tools/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ToolEditPage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === "new";

  let tool = null;
  if (!isNew) {
    tool = await getToolById(id);
    if (!tool) {
      notFound();
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <BackButton href="/products/tools" />
        <Typography variant="h4" fontWeight="bold">
          {isNew ? "도구 등록" : "도구 수정"}
        </Typography>
      </Stack>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <ToolForm tool={tool} isNew={isNew} />
      </Paper>
    </Box>
  );
}
