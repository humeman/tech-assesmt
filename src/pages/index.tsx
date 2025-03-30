import Head from 'next/head';
import useSWR, {mutate} from 'swr';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, TextField } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// Icon for Add Customer button
import { AddRounded } from '@mui/icons-material';
import { useState } from 'react';

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
};

export type Customers = Customer[];

export type ApiError = {
  code: string;
  message: string;
};

const Home = () => {
  // SWR is a great library for geting data, but is not really a solution
  // for POST requests. You'll want to use either another library or
  // the Fetch API for adding new customers.
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok) throw body;
    return body;
  };
  const { data, error, isLoading } = useSWR<Customers, ApiError>(
    '/api/customers',
    fetcher
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  return (
    <>
      <Head>
        <title>Dwolla | Customers</title>
      </Head>
      <main>
        <Box sx={{ 
          bgcolor: "background.paper", 
          maxWidth: { md: "90%", lg: "50%" },
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          marginTop: "3vh",
          marginBottom: "3vh",
          borderRadius: 1,
          boxShadow: 1
         }}>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && (
              <Box>
                <Box sx={{
                  display: "flex",
                  flexDirection: "row"
                }}>
                </Box>
                <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none" }}>{data.length} Customers</TableCell>
                    <TableCell sx={{ borderBottom: "none" }} align="right">
                      <Button variant="contained" sx={{ textTransform: "none", fontWeight: 700 }} 
                        onClick={
                          () => {
                            setShowAddCustomer(true);
                          }
                        }>
                        Add Customer <AddRounded sx={{ marginLeft: 1 }}/>
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map(customer => (
                      <TableRow key={customer.email}>
                        <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              </Box>
            )}
            <Dialog 
              open={showAddCustomer}
              onClose={() => setShowAddCustomer(false)}
              // https://mui.com/material-ui/react-dialog/#form-dialogs
              slotProps={{
                paper: {
                  component: 'form',
                  onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
                    setIsSubmitting(true);
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries(formData.entries());
                    const res = await fetch('/api/customers', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(formJson),
                    })
                    if (!res.ok) {
                      // We'd obviously want something a little more user friendly here,
                      // but given the scope of this assignment it does not seem necessary now.
                      alert(`Failed to post: ${res.status}, ${await res.text()}`);
                    }
                    // https://stackoverflow.com/a/61702840
                    mutate('/api/customers');
                    setIsSubmitting(false);
                    setShowAddCustomer(false);
                  }
                }
              }}>
                <DialogTitle>Add Customer</DialogTitle>
                <DialogContent>
                                                  {/* Padding here is weird, but the label on top gets cut off otherwise */}
                  <Grid2 container spacing={1} sx={{ paddingTop: 1 }}>
                    <Grid2 size={4}>
                      <TextField required id="firstName" name="firstName" label="First Name"/>
                    </Grid2>
                    <Grid2 size={4}>
                      <TextField required id="lastName" name="lastName" label="Last Name"/>
                    </Grid2>
                    <Grid2 size={4}>
                      <TextField id="businessName" name="businessName" label="Business Name"/>
                    </Grid2>
                  </Grid2>
                  <TextField required fullWidth id="email" type="email" name="email" label="Email Address" sx={{ marginTop: 3 }}/>
                </DialogContent>
                <DialogActions sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", marginTop: 3 }}>
                  <Button variant="text" sx={{ textTransform: "none" }} onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} variant="contained" sx={{ marginLeft: 2, textTransform: "none" }}>Submit</Button>
                </DialogActions>
            </Dialog>
        </Box>
      </main>
    </>
  );
};

export default Home;
