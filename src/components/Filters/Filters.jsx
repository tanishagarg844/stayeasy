import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, resetFilters } from "../../redux/hotelsSlice";
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Checkbox, 
  Select, 
  MenuItem, 
  TextField, 
  Chip, 
  Stack, 
  Divider, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from "@mui/material";
import { 
  Star, 
  Business, 
  Wifi, 
  Pool, 
  Restaurant, 
  LocalParking, 
  FitnessCenter, 
  Bed, 
  AccessTime, 
  Security,
  Clear,
  FilterList,
  ExpandMore,
  AttachMoney
} from "@mui/icons-material";

export function Filters() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.hotels);
  const { list: hotels, status } = useSelector((state) => state.hotels);

  const filterOptions = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return {};

    const ratings = [...new Set(hotels.map(h => h.rating).filter(Boolean))];
    const segments = [...new Set(hotels.flatMap(h => h.segments || []).filter(Boolean))];
    const accommodationTypes = [...new Set(hotels.map(h => h.hotelAccommodation).filter(Boolean))];
    const facilities = [...new Set(hotels.flatMap(h => h.facilityResponses?.map(f => f.name) || []).filter(Boolean))];

    return {
      ratings: ratings.sort(),
      segments: segments.sort(),
      accommodationTypes: accommodationTypes.sort(),
      facilities: facilities.sort()
    };
  }, [hotels]);

  const overallPriceRange = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return { min: 0, max: 100000 };

    const prices = hotels
      .map(h => h.roomResponses?.reduce((min, room) => {
        const price = room.rateKeyResponses?.totalPrice || 0;
        return price > 0 && (min === 0 || price < min) ? price : min;
      }, 0) || 0)
      .filter(p => p > 0);

    if (prices.length === 0) return { min: 0, max: 100000 };
    
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100
    };
  }, [hotels]);

  if (status === "loading" || !hotels) {
    return (
      <Stack spacing={2}>
        <Box sx={{ height: 24, bgcolor: 'grey.200', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </Stack>
    );
  }

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== null && v !== 0 && v !== 100000 && (!Array.isArray(v) || v.length > 0)
  ).length;

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const toggleFacility = (facility) => {
    const currentFacilities = filters.facilities || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility];
    handleFilterChange('facilities', newFacilities);
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  const getFacilityIcon = (facilityName) => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi />;
    if (name.includes('pool') || name.includes('swimming')) return <Pool />;
    if (name.includes('restaurant') || name.includes('dining')) return <Restaurant />;
    if (name.includes('parking') || name.includes('car')) return <LocalParking />;
    if (name.includes('gym') || name.includes('fitness')) return <FitnessCenter />;
    if (name.includes('room service')) return <Bed />;
    if (name.includes('24-hour')) return <AccessTime />;
    if (name.includes('safe')) return <Security />;
    return <Business />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
        </Box>
        {activeFilterCount > 0 && (
          <Button
            startIcon={<Clear />}
            onClick={handleReset}
            size="small"
            color="primary"
          >
            Clear All
          </Button>
        )}
      </Box>

      {filterOptions.ratings && filterOptions.ratings.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color="primary" />
              <Typography variant="subtitle1" fontWeight="medium">
                Star Rating
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={filters.rating || ""}
                onChange={(e) => handleFilterChange('rating', e.target.value || null)}
              >
                {filterOptions.ratings.map((rating) => {
                  const starCount = parseInt(rating.match(/\d+/)?.[0] || "0");
                  return (
                    <FormControlLabel
                      key={rating}
                      value={rating}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {Array.from({ length: Math.min(5, starCount) }).map((_, i) => (
                              <Star key={i} sx={{ color: '#ffc107', fontSize: 16 }} />
                            ))}
                          </Box>
                          <Typography variant="body2">{rating}</Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      )}

      {filterOptions.segments && filterOptions.segments.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business color="primary" />
              <Typography variant="subtitle1" fontWeight="medium">
                Hotel Segment
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <Select
                value={filters.segment || ""}
                onChange={(e) => handleFilterChange('segment', e.target.value || null)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">All Segments</MenuItem>
                {filterOptions.segments.map((segment) => (
                  <MenuItem key={segment} value={segment}>{segment}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      )}

      {filterOptions.accommodationTypes && filterOptions.accommodationTypes.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bed color="primary" />
              <Typography variant="subtitle1" fontWeight="medium">
                Accommodation Type
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <Select
                value={filters.accommodationType || ""}
                onChange={(e) => handleFilterChange('accommodationType', e.target.value || null)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                {filterOptions.accommodationTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      )}

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            <Typography variant="subtitle1" fontWeight="medium">
              Price Range
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Price"
                type="number"
                value={filters.minPrice || ""}
                onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <Typography variant="caption" sx={{ mr: 1 }}>₹</Typography>
                }}
              />
              <TextField
                label="Max Price"
                type="number"
                value={filters.maxPrice === 100000 ? "" : filters.maxPrice || ""}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 100000)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <Typography variant="caption" sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Box>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" color="text.secondary">
                Range: {formatPrice(overallPriceRange.min)} - {formatPrice(overallPriceRange.max)}
              </Typography>
            </Paper>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Key Facilities */}
      {filterOptions.facilities && filterOptions.facilities.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Wifi color="primary" />
              <Typography variant="subtitle1" fontWeight="medium">
                Key Facilities
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {filterOptions.facilities.slice(0, 20).map((facility) => (
                <ListItem key={facility} sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      checked={filters.facilities?.includes(facility) || false}
                      onChange={() => toggleFacility(facility)}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: 'primary.main' }}>
                          {getFacilityIcon(facility)}
                        </Box>
                        <Typography variant="body2">
                          {facility}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {activeFilterCount > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Active Filters ({activeFilterCount})
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {filters.rating && (
                <Chip
                  label={`Rating: ${filters.rating}`}
                  onDelete={() => handleFilterChange('rating', null)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.segment && (
                <Chip
                  label={`Segment: ${filters.segment}`}
                  onDelete={() => handleFilterChange('segment', null)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.accommodationType && (
                <Chip
                  label={`Type: ${filters.accommodationType}`}
                  onDelete={() => handleFilterChange('accommodationType', null)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.minPrice > 0 && (
                <Chip
                  label={`Min: ${formatPrice(filters.minPrice)}`}
                  onDelete={() => handleFilterChange('minPrice', 0)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.maxPrice < 100000 && (
                <Chip
                  label={`Max: ${formatPrice(filters.maxPrice)}`}
                  onDelete={() => handleFilterChange('maxPrice', 100000)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.facilities?.map((facility) => (
                <Chip
                  key={facility}
                  label={facility}
                  onDelete={() => toggleFacility(facility)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        </>
      )}

      {activeFilterCount > 0 && (
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleReset}
          fullWidth
          color="primary"
        >
          Clear All Filters
        </Button>
      )}
    </Stack>
  );
}
