import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../redux/hotelsSlice";
import { PropertyCard } from "../components/Hotels/PropertyCard";
import { DetailsDrawer } from "../components/Hotels/DetailsDrawer";
import { Filters } from "../components/Filters/Filters";
import { SearchForm } from "../components/Search/SearchForm";
import { 
  Box, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Button, 
  Chip, 
  Grid, 
  Paper,  
  Fab, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  Stack,
  Avatar,
  Badge
} from "@mui/material";
import { 
  Business, 
  Bed, 
  Event, 
  Star, 
  Filter,
  Close,
  Search,
  ArrowBack,
  Sort,
  ViewList,
  GridView
} from "@mui/icons-material";

export default function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { list: hotels, status, error } = useSelector((state) => state.hotels);
  const { filters, sort, nameQuery } = useSelector((state) => state.hotels);
  
  const [openIdx, setOpenIdx] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const destination = searchParams.get("destination") || "";
  const destinationId = searchParams.get("destinationId") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const occParam = searchParams.get("occ") || "";

  const occ = useMemo(() => {
    try {
      return occParam ? JSON.parse(decodeURIComponent(occParam)) : [{ adults: 2, children: 0 }];
    } catch {
      return [{ adults: 2, children: 0 }];
    }
  }, [occParam]);

  useEffect(() => {
    if (destination && from && to) {
      const stay = {
        checkIn: from,
        checkOut: to
      };
      
      const occupancies = occ;
      
      dispatch(fetchHotels({ stay, occupancies, filters, destinationId: destinationId || null }));
    }
  }, [destination, from, to, occ, filters, destinationId, dispatch]);

  const onSearchSubmit = ({ destination, destinationId, from, to, occ }) => {
    const params = new URLSearchParams({
      destination,
      destinationId: destinationId || "",
      from,
      to,
      occ: encodeURIComponent(JSON.stringify(occ)),
    });
    setSearchParams(params);
  };

  const processedHotels = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return [];
    
    return hotels.map(hotel => {
      const displayLowestPrice = hotel.roomResponses?.reduce((min, room) => {
        const price = room.rateKeyResponses?.totalPrice || 0;
        return price > 0 && (min === 0 || price < min) ? price : min;
      }, 0) || 0;

      return {
        ...hotel,
        displayLowestPrice
      };
    });
  }, [hotels]);

  const filtered = useMemo(() => {
    let result = [...processedHotels];

    if (nameQuery) {
      const query = nameQuery.toLowerCase();
      result = result.filter(hotel => 
        hotel.hotelName?.toLowerCase().includes(query) ||
        hotel.address?.toLowerCase().includes(query)
      );
    }

    if (filters.rating) {
      const starCount = parseInt(filters.rating);
      result = result.filter(hotel => {
        const hotelRating = parseInt(hotel.rating?.match(/\d+/)?.[0] || "0");
        return hotelRating === starCount;
      });
    }

    if (filters.segment) {
      result = result.filter(hotel => 
        hotel.segments?.includes(filters.segment)
      );
    }

    if (filters.accommodationType) {
      result = result.filter(hotel => 
        hotel.hotelAccommodation === filters.accommodationType
      );
    }

    if (filters.facilities?.length > 0) {
      result = result.filter(hotel => 
        filters.facilities.every(facility => 
          hotel.facilityResponses?.some(f => f.name === facility)
        )
      );
    }

    if (filters.minPrice > 0 || filters.maxPrice < 100000) {
      result = result.filter(hotel => {
        const price = hotel.displayLowestPrice;
        return price >= filters.minPrice && price <= filters.maxPrice;
      });
    }

    if (sort === "asc") {
      result.sort((a, b) => a.displayLowestPrice - b.displayLowestPrice);
    } else if (sort === "desc") {
      result.sort((a, b) => b.displayLowestPrice - a.displayLowestPrice);
    }

    return result;
  }, [processedHotels, filters, sort, nameQuery]);

  const resultsStats = useMemo(() => {
    if (filtered.length === 0) return null;
    
    const prices = filtered.map(h => h.displayLowestPrice).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgRating = filtered.reduce((sum, h) => {
      const rating = parseInt(h.rating?.match(/\d+/)?.[0] || "0");
      return sum + rating;
    }, 0) / filtered.length;
    
    return {
      total: filtered.length,
      priceRange: { min: minPrice, max: maxPrice },
      avgRating: Math.round(avgRating)
    };
  }, [filtered]);

  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <CircularProgress size={80} sx={{ color: 'white' }} />
        <Typography variant="h4" color="white" fontWeight="bold">
          Searching for Hotels...
        </Typography>
        <Typography variant="h6" color="white" sx={{ opacity: 0.8 }}>
          Finding the best options for your stay
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 500, 
            bgcolor: 'white',
            '& .MuiAlert-icon': { fontSize: 40 }
          }}
        >
          <AlertTitle>Search Error</AlertTitle>
          {error}
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate("/")}
              sx={{ bgcolor: '#1976d2' }}
            >
              Try Again
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Chip 
              icon={<Business />} 
              label={destination} 
              variant="outlined" 
              color="primary"
            />
            <Chip 
              icon={<Event />} 
              label={`${from} - ${to}`} 
              variant="outlined" 
              color="primary"
            />
            <Chip 
              icon={<Bed />} 
              label={`${occ.reduce((sum, o) => sum + o.adults + o.children, 0)} guests`} 
              variant="outlined" 
              color="primary"
            />
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton
              color="primary"
              onClick={() => setShowSearchForm(!showSearchForm)}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <Search />
            </IconButton>
            
            <Button
              variant="contained"
              startIcon={<Filter />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ 
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              Filters
              {Object.values(filters).some(v => v !== null && v !== 0 && v !== 100000 && (!Array.isArray(v) || v.length > 0)) && (
                <Badge 
                  badgeContent={Object.values(filters).filter(v => v !== null && v !== 0 && v !== 100000 && (!Array.isArray(v) || v.length > 0)).length} 
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          </Stack>
        </Toolbar>

        {showSearchForm && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <SearchForm onSubmit={onSearchSubmit} />
            </Paper>
          </Box>
        )}
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Filters Sidebar */}
          {showFilters && (
            <Grid item xs={12} lg={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  position: 'sticky',
                  top: 100,
                  maxHeight: 'calc(100vh - 120px)',
                  overflow: 'auto'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Filters
                  </Typography>
                  <IconButton
                    onClick={() => setShowFilters(false)}
                    sx={{ display: { xs: 'flex', lg: 'none' } }}
                  >
                    <Close />
                  </IconButton>
                </Box>
                <Filters />
              </Paper>
            </Grid>
          )}

          {/* Hotels List */}
          <Grid item xs={12} lg={showFilters ? 9 : 12}>
            {resultsStats && (
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Stack direction="row" spacing={4} alignItems="center">
                      <Box textAlign="center">
                        <Typography variant="h3" fontWeight="bold" color="primary">
                          {resultsStats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Properties
                        </Typography>
                      </Box>
                      
                      {resultsStats.priceRange.min > 0 && (
                        <Box textAlign="center">
                          <Typography variant="h6" fontWeight="bold">
                            ₹{resultsStats.priceRange.min.toLocaleString()} - ₹{resultsStats.priceRange.max.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Price Range
                          </Typography>
                        </Box>
                      )}
                      
                      <Box textAlign="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 0.5 }}>
                          {Array.from({ length: resultsStats.avgRating }).map((_, i) => (
                            <Star key={i} sx={{ color: '#ffc107', fontSize: 20 }} />
                          ))}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Avg Rating
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Sort by:
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Sort />}
                        select
                        value={sort || ""}
                        onChange={(e) => dispatch({ type: "hotels/setSort", payload: e.target.value || null })}
                        sx={{ minWidth: 200 }}
                      >
                        {sort === "asc" ? "Price: Low to High" : 
                         sort === "desc" ? "Price: High to Low" : "Recommended"}
                      </Button>
                      
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          color={viewMode === 'grid' ? 'primary' : 'default'}
                          onClick={() => setViewMode('grid')}
                        >
                          <GridView />
                        </IconButton>
                        <IconButton
                          color={viewMode === 'list' ? 'primary' : 'default'}
                          onClick={() => setViewMode('list')}
                        >
                          <ViewList />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {filtered.length === 0 ? (
              <Paper elevation={2} sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.300', mx: 'auto', mb: 3 }}>
                  <Business sx={{ fontSize: 40, color: 'grey.600' }} />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  No Properties Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                  Try adjusting your search criteria or filters to find more options.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowFilters(true)}
                  sx={{ bgcolor: '#1976d2' }}
                >
                  Adjust Filters
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filtered.map((hotel, idx) => (
                  <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={hotel.id || idx}>
                    <PropertyCard
                      item={hotel}
                      onOpen={() => setOpenIdx(idx)}
                      viewMode={viewMode}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="filters"
        onClick={() => setShowFilters(!showFilters)}
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { xs: 'flex', lg: 'none' }
        }}
      >
        <Filter />
      </Fab>

      {openIdx !== null && (
        <DetailsDrawer
          open={openIdx !== null}
          onClose={() => setOpenIdx(null)}
          data={filtered[openIdx]}
        />
      )}
    </Box>
  );
}
