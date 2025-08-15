import React, { useState, useMemo } from "react";
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  IconButton, 
  Stack, 
  Divider, 
  Rating,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  Star, 
  LocationOn, 
  Wifi, 
  Pool, 
  Restaurant, 
  LocalParking, 
  FitnessCenter, 
  Bed, 
  AccessTime, 
  CheckCircle, 
  ExpandMore, 
  ExpandLess,
  Phone,
  Email,
  NavigateBefore,
  NavigateNext,
  Favorite,
  FavoriteBorder,
  AttachMoney,
  People,
  Business as BusinessIcon
} from "@mui/icons-material";

export function PropertyCard({ item, onOpen, viewMode = 'grid' }) {
  const [showMoreRooms, setShowMoreRooms] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  const hotelName = item?.hotelName || item?.name || "Hotel";
  const hotelCode = item?.hotelCode || "";
  const rating = item?.rating || "0 STARS";
  const description = item?.description || "";
  const address = item?.address || "";
  const postalCode = item?.postalCode || "";
  const email = item?.email || "";
  const phoneNumbers = item?.phoneResponses || [];
  const segments = item?.segments || [];
  const hotelAccommodation = item?.hotelAccommodation || "";
  
  const hotelImages = useMemo(() => {
    if (item?.hotelImageLinks?.length > 0) {
      return item.hotelImageLinks.map(img => img.imageLink).filter(Boolean);
    }
    return [];
  }, [item?.hotelImageLinks]);

  const roomOptions = useMemo(() => {
    if (!item?.roomResponses) return [];
    
    const roomMap = new Map();
    
    item.roomResponses.forEach(room => {
      const key = `${room.roomName}-${room.roomCode}`;
      if (!roomMap.has(key)) {
        roomMap.set(key, {
          ...room,
          boardOptions: []
        });
      }
      
      const existingRoom = roomMap.get(key);
      existingRoom.boardOptions.push({
        boardName: room.boardNameResponse[0]?.boardName || "ROOM ONLY",
        boardCode: room.boardNameResponse[0]?.boardCode,
        price: room.rateKeyResponses?.totalPrice || 0,
        cancellationPolicy: room.rateKeyResponses?.rateKeys?.[0]?.cancellationPolicy?.[0],
        roomRateKey: room.rateKeyResponses?.rateKeys?.[0]?.roomRateKey
      });
    });
    
    roomMap.forEach(room => {
      room.boardOptions.sort((a, b) => a.price - b.price);
    });
    
    return Array.from(roomMap.values()).sort((a, b) => {
      const aMinPrice = Math.min(...a.boardOptions.map(b => b.price));
      const bMinPrice = Math.min(...b.boardOptions.map(b => b.price));
      return aMinPrice - bMinPrice;
    });
  }, [item?.roomResponses]);

  const lowestPrice = useMemo(() => {
    if (roomOptions.length === 0) return 0;
    return Math.min(...roomOptions.flatMap(room => 
      room.boardOptions.map(board => board.price)
    ));
  }, [roomOptions]);

  const topFacilities = useMemo(() => {
    if (!item?.facilityResponses) return [];
    
    const importantFacilities = item.facilityResponses
      .filter(f => f.facilityGroup === "Facilities" || f.facilityGroup === "Room facilities (Standard room)")
      .slice(0, 8);
    
    return importantFacilities;
  }, [item?.facilityResponses]);

  const interestPoints = item?.interestPoints || [];

  const formatPrice = (price) => {
    if (price === 0) return "Price on request";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getRatingValue = (rating) => {
    const starCount = parseInt(rating.match(/\d+/)?.[0] || "0");
    return Math.min(5, starCount);
  };

  const getFacilityIcon = (amenity) => {
    const amenityName = (amenity?.name || amenity || "").toLowerCase();
    if (amenityName.includes('wifi') || amenityName.includes('internet')) return <Wifi />;
    if (amenityName.includes('pool') || amenityName.includes('swimming')) return <Pool />;
    if (amenityName.includes('restaurant') || amenityName.includes('dining')) return <Restaurant />;
    if (amenityName.includes('parking') || amenityName.includes('car')) return <LocalParking />;
    if (amenityName.includes('gym') || amenityName.includes('fitness')) return <FitnessCenter />;
    if (amenityName.includes('room service')) return <Bed />;
    if (amenityName.includes('24-hour')) return <AccessTime />;
    return <CheckCircle />;
  };

  const formatBoardName = (boardName) => {
    const boardMap = {
      'ROOM ONLY': 'Room Only',
      'BED AND BREAKFAST': 'B&B',
      'HALF BOARD': 'Half Board',
      'FULL BOARD': 'Full Board',
      'ALL INCLUSIVE': 'All Inclusive'
    };
    return boardMap[boardName] || boardName;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const isListView = viewMode === 'list';

  return (
    <>
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: isListView ? 'row' : 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 8,
            transform: 'translateY(-4px)'
          }
        }}
      >
        {/* Image Section */}
        <Box sx={{ position: 'relative', flex: isListView ? '0 0 300px' : 'none' }}>
          {hotelImages.length > 0 ? (
            <>
              <CardMedia
                component="img"
                height={isListView ? "100%" : "250"}
                image={hotelImages[currentImageIndex]}
                alt={`${hotelName} - ${currentImageIndex + 1}`}
                sx={{ 
                  cursor: 'pointer',
                  objectFit: 'cover'
                }}
                onClick={() => setImageDialogOpen(true)}
              />
              
              {/* Carousel Navigation */}
              {hotelImages.length > 1 && (
                <>
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                  
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    <NavigateNext />
                  </IconButton>

                  {/* Image Indicators */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1
                  }}>
                    {hotelImages.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => goToImage(index)}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                        }}
                      />
                    ))}
                  </Box>

                  {/* Image Counter */}
                  <Chip
                    label={`${currentImageIndex + 1} / ${hotelImages.length}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white'
                    }}
                  />
                </>
              )}
            </>
          ) : (
            <Box sx={{ 
              height: isListView ? "100%" : "250", 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.200'
            }}>
              <BusinessIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            </Box>
          )}

          {/* Top Badges */}
          <Stack spacing={1} sx={{ position: 'absolute', top: 16, left: 16 }}>
            <Chip
              icon={<Star />}
              label={rating}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.95)' }}
            />
            
            {hotelAccommodation && (
              <Chip
                label={hotelAccommodation}
                size="small"
                color="primary"
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              />
            )}

            {segments.length > 0 && (
              <Chip
                label={segments[0]}
                size="small"
                color="success"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
            )}
          </Stack>

          {/* Favorite Button */}
          <IconButton
            onClick={() => setIsFavorite(!isFavorite)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>

          {/* Price Badge */}
          {lowestPrice > 0 && (
            <Chip
              icon={<AttachMoney />}
              label={`From ${formatPrice(lowestPrice)}`}
              color="warning"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'warning.main',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>

        {/* Content Section */}
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Stack spacing={2}>
            {/* Header */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, pr: 2 }}>
                  {hotelName}
                </Typography>
                {hotelCode && (
                  <Chip label={`#${hotelCode}`} size="small" variant="outlined" />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={getRatingValue(rating)} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {rating}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn color="primary" sx={{ mt: 0.5, fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {address}
                  </Typography>
                  {postalCode && (
                    <Typography variant="caption" color="text.secondary">
                      {postalCode}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Description */}
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {description}
              </Typography>
            )}

            {/* Room Options */}
            {roomOptions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bed color="primary" />
                  Room Options
                </Typography>
                
                <Stack spacing={1}>
                  {roomOptions.slice(0, showMoreRooms ? roomOptions.length : 2).map((room, roomIdx) => (
                    <Paper key={roomIdx} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {room.roomName}
                        </Typography>
                        <Chip
                          icon={<People />}
                          label={`${room.rooms} room • ${room.adults} adults • ${room.children} children`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                      
                      <Stack spacing={0.5}>
                        {room.boardOptions.slice(0, 2).map((board, boardIdx) => (
                          <Box key={boardIdx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {formatBoardName(board.boardName)}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {formatPrice(board.price)}
                            </Typography>
                          </Box>
                        ))}
                        {room.boardOptions.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{room.boardOptions.length - 2} more options
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                {roomOptions.length > 2 && (
                  <Button
                    startIcon={showMoreRooms ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowMoreRooms(!showMoreRooms)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    {showMoreRooms ? 'Show Less' : `Show ${roomOptions.length - 2} More Rooms`}
                  </Button>
                )}
              </Box>
            )}

            {/* Facilities */}
            {topFacilities.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Key Features
                </Typography>
                <Grid container spacing={1}>
                  {topFacilities.map((facility, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: 'primary.main' }}>
                          {getFacilityIcon(facility)}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                          {facility?.name || facility}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Nearby Places */}
            {interestPoints.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Nearby Places
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {interestPoints.slice(0, 3).map((point, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={point.pointName}
                        secondary={`${point.distance}m`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption', color: 'primary' }}
                      />
                    </ListItem>
                  ))}
                  {interestPoints.length > 3 && (
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        secondary={`+${interestPoints.length - 3} more places`}
                        secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}

            {/* Contact Info */}
            <Divider />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="success" sx={{ fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary">
                  {phoneNumbers[0]?.phoneNumber || "Phone not available"}
                </Typography>
              </Box>
              
              {email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email color="primary" sx={{ fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {email}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Action Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={onOpen}
              sx={{ 
                mt: 2,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              View Details & Book
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {hotelImages.length > 0 && (
            <>
              <img
                src={hotelImages[currentImageIndex]}
                alt={`${hotelName} - ${currentImageIndex + 1}`}
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
              />
              
              {hotelImages.length > 1 && (
                <>
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                  
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
