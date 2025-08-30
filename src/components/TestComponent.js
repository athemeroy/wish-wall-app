"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
} from '@mui/material';

export default function TestComponent() {
  const [count, setCount] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">测试组件</Typography>
      <Typography>计数: {count}</Typography>
      <Button onClick={() => setCount(count + 1)}>
        增加计数
      </Button>
    </Box>
  );
}
