import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useDraftSocket } from '../ws/useDraftSocket';
import { SportLeague, OrderType } from '../ws/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DraftPicker: React.FC = () => {
  const { idToken, logout } = useAuth();
  const { send, lastMessage } = useDraftSocket(idToken);
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);

  // createDraft/joinDraft don't get a direct request/response - the server
  // replies with a "draftState" message once the draft is created/joined,
  // which is our cue to navigate into the draft room.
  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    if (lastMessage.type === 'draftState') {
      navigate(`/draft/${lastMessage.draft.draftId}`);
    } else if (lastMessage.type === 'error') {
      alert(`Error: ${lastMessage.message}`);
    }
  }, [lastMessage, navigate]);

  // Create draft form
  const [createForm, setCreateForm] = useState({
    name: '',
    sportLeague: 'NBA' as SportLeague,
    orderType: 'snake' as OrderType,
    pickTimerSeconds: 30,
    totalRounds: 10,
    draftPassword: '',
    teamNames: [''] as string[],
  });

  // Join draft form
  const [joinForm, setJoinForm] = useState({
    draftId: '',
    draftPassword: '',
    fantasyTeamId: '',
  });

  const handleCreateFormChange = (field: string, value: any) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJoinFormChange = (field: string, value: string) => {
    setJoinForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTeamName = () => {
    setCreateForm((prev) => ({
      ...prev,
      teamNames: [...prev.teamNames, ''],
    }));
  };

  const removeTeamName = (index: number) => {
    setCreateForm((prev) => ({
      ...prev,
      teamNames: prev.teamNames.filter((_, i) => i !== index),
    }));
  };

  const updateTeamName = (index: number, value: string) => {
    setCreateForm((prev) => {
      const newTeamNames = [...prev.teamNames];
      newTeamNames[index] = value;
      return { ...prev, teamNames: newTeamNames };
    });
  };

  const handleCreateDraft = () => {
    if (!createForm.name || !createForm.draftPassword || createForm.teamNames.some((name) => !name)) {
      alert('Please fill in all fields');
      return;
    }

    send({
      action: 'createDraft',
      name: createForm.name,
      sportLeague: createForm.sportLeague,
      draftPassword: createForm.draftPassword,
      orderType: createForm.orderType,
      pickTimerSeconds: createForm.pickTimerSeconds,
      totalRounds: createForm.totalRounds,
      teamNames: createForm.teamNames,
    });
  };

  const handleJoinDraft = () => {
    if (!joinForm.draftId || !joinForm.draftPassword || !joinForm.fantasyTeamId) {
      alert('Please fill in all fields');
      return;
    }

    send({
      action: 'joinDraft',
      draftId: joinForm.draftId,
      draftPassword: joinForm.draftPassword,
      fantasyTeamId: joinForm.fantasyTeamId,
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 2, textAlign: 'right' }}>
        <Button variant="outlined" color="inherit" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
        <CardHeader title="Fantasy Draft" />
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="draft tabs"
          >
            <Tab label="Create a Draft" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Join a Draft" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <TextField
                label="Draft Name"
                value={createForm.name}
                onChange={(e) => handleCreateFormChange('name', e.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Sport League</InputLabel>
                <Select
                  value={createForm.sportLeague}
                  label="Sport League"
                  onChange={(e) => handleCreateFormChange('sportLeague', e.target.value as SportLeague)}
                >
                  <MenuItem value="NBA">NBA</MenuItem>
                  <MenuItem value="NFL">NFL</MenuItem>
                  <MenuItem value="MLB">MLB</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={createForm.orderType}
                  label="Order Type"
                  onChange={(e) => handleCreateFormChange('orderType', e.target.value as OrderType)}
                >
                  <MenuItem value="snake">Snake</MenuItem>
                  <MenuItem value="linear">Linear</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Pick Timer (seconds)"
                type="number"
                value={createForm.pickTimerSeconds}
                onChange={(e) => handleCreateFormChange('pickTimerSeconds', parseInt(e.target.value, 10))}
                fullWidth
              />

              <TextField
                label="Total Rounds"
                type="number"
                value={createForm.totalRounds}
                onChange={(e) => handleCreateFormChange('totalRounds', parseInt(e.target.value, 10))}
                fullWidth
              />

              <TextField
                label="Draft Password"
                type="password"
                value={createForm.draftPassword}
                onChange={(e) => handleCreateFormChange('draftPassword', e.target.value)}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Team Names
                </Typography>
                <Stack spacing={1}>
                  {createForm.teamNames.map((name, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label={`Team ${index + 1}`}
                        value={name}
                        onChange={(e) => updateTeamName(index, e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeTeamName(index)}
                        disabled={createForm.teamNames.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={addTeamName}
                  >
                    Add Team
                  </Button>
                </Stack>
              </Box>

              <Button variant="contained" color="primary" fullWidth onClick={handleCreateDraft}>
                Create Draft
              </Button>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <TextField
                label="Draft ID"
                value={joinForm.draftId}
                onChange={(e) => handleJoinFormChange('draftId', e.target.value)}
                fullWidth
              />

              <TextField
                label="Draft Password"
                type="password"
                value={joinForm.draftPassword}
                onChange={(e) => handleJoinFormChange('draftPassword', e.target.value)}
                fullWidth
              />

              <TextField
                label="Fantasy Team ID"
                value={joinForm.fantasyTeamId}
                onChange={(e) => handleJoinFormChange('fantasyTeamId', e.target.value)}
                fullWidth
                helperText="Enter the fantasy team ID to join"
              />

              <Button variant="contained" color="primary" fullWidth onClick={handleJoinDraft}>
                Join Draft
              </Button>
            </Stack>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DraftPicker;
