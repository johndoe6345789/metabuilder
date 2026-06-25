/**
 * Component registry for the component tree renderer.
 * Maps string names from features.json to actual React components.
 */

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@metabuilder/components/m3';
import React from 'react';

export const componentRegistry: Record<
  string,
  React.ComponentType<any>
> = {
  Accordion, AccordionDetails, AccordionSummary, Alert,
  AppBar, Box, Button, Card, CardContent, Checkbox, Chip,
  CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Drawer, FormControl, FormControlLabel, Grid,
  IconButton, InputLabel, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, MenuItem, Pagination, Paper,
  Select, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, TextField, Toolbar, Tooltip,
  Typography,
};

export { iconOverrides, resolveIcon } from './iconRegistry';
