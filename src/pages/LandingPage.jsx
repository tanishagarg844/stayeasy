import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Container, Typography, Link as MuiLink, Paper } from "@mui/material";
import { Apartment as BuildingIcon } from "@mui/icons-material";
import { SearchForm } from "../components/Search/SearchForm";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSubmit = ({ destination, destinationId, from, to, occ }) => {
    const params = new URLSearchParams({
      destination,
      destinationId,
      from,
      to,
      occ: encodeURIComponent(JSON.stringify(occ)),
    });
    navigate(`/results?${params.toString()}`);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="primary.main"
      color="white"
    >
      {/* HEADER */}
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <BuildingIcon /> StayEasy
        </Typography>
        <MuiLink
          component={Link}
          to="/results"
          underline="hover"
          color="inherit"
          sx={{ fontSize: "0.9rem" }}
        >
          Skip to Results
        </MuiLink>
      </Container>

      {/* HERO TEXT */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Typography variant="h3" fontWeight="bold">
          Find your next stay
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)" mt={1}>
          Search low prices on hotels, homes and much more...
        </Typography>
      </Container>

      {/* SEARCH BAR */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          elevation={4}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "white",
          }}
        >
          <SearchForm onSubmit={handleSubmit} />
        </Paper>
      </Container>

      {/* FOOTER */}
      <Box
        mt="auto"
        textAlign="center"
        py={3}
        sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}
      >
        Demo app • React + Redux • API: travelyatra dummy
      </Box>
    </Box>
  );
}
