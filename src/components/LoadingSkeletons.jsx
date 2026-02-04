import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

export const DashboardSkeleton = () => (
  <Box sx={{ mt: 4 }}>
    <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={48} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Box sx={{ mt: 4 }}>
      <Skeleton variant="rectangular" height={300} />
    </Box>
  </Box>
);

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: columns }).map((_, index) => (
            <TableCell key={index}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export const DetailsSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={300} height={48} sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" height={32} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        {[1, 2, 3].map((item) => (
          <Card key={item} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="70%" />
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  </Box>
);

export const FormSkeleton = () => (
  <Paper sx={{ p: 4 }}>
    <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} key={item}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
      </Grid>
    </Grid>
  </Paper>
);
