import { Box, Flex, Grid, GridItem, Text, HStack, Stack, Tooltip, Button, Image } from '@chakra-ui/react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import dynamic from 'next/dynamic';
import { useRecoilValue } from 'recoil';

import { SignInButton } from '../components/SignInButton';
import { SummaryCards } from '../components/SummaryCards';
import { DailySlpChart } from '../components/DailySlpChart';
import { Card } from '../components/Card';
import { PreferencesButton } from '@src/components/Header/PreferencesButton';
import { NotablePerformersTable } from '@src/components/NotablePerformersTable';
import { EarningsForecastChart } from '@src/components/EarningsForecastChart';
import { scholarsMap } from '@src/recoil/scholars';
import { useBatchScholar } from '@src/services/hooks/useBatchScholar';

function DashboardPage() {
  const scholars = useRecoilValue(scholarsMap);
  const addresses = scholars.map(scholar => scholar.address);

  const { isError, refetchAll } = useBatchScholar({ addresses });

  return (
    <Box h="full" maxW="1450px" margin="auto" p={3}>
      <Flex justify="space-between" direction={{ base: 'column', lg: 'row' }}>
        <Text fontSize="3xl" fontWeight="bold">
          Dashboard
        </Text>

        <HStack>
          <SignInButton />
          <PreferencesButton variant="solid" />
        </HStack>
      </Flex>

      {!isError && (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} mt={10} gap={8} pb={5}>
          <GridItem colSpan={1}>
            <SummaryCards />
          </GridItem>

          <GridItem colSpan={1}>
            <Stack>
              <HStack>
                <Text fontWeight="bold" fontSize="lg">
                  Earnings Forecast
                </Text>

                <Tooltip label="How much should be your total accumulated value assuming your scholars daily average is constant and you make no claims.">
                  <Box>
                    <AiOutlineInfoCircle />
                  </Box>
                </Tooltip>
              </HStack>

              <Card p={5}>
                <EarningsForecastChart />
              </Card>
            </Stack>
          </GridItem>

          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <NotablePerformersTable />
          </GridItem>

          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Card p={5}>
              <Text fontWeight="bold" fontSize="lg">
                Daily SLP
              </Text>

              <DailySlpChart />
            </Card>
          </GridItem>
        </Grid>
      )}

      {isError && (
        <Flex align="center" direction="column" w="100%" px={{ base: 1, lg: 0 }} mt={24}>
          <Image src="/images/axies/dead.png" alt="Dead Axie" opacity={0.9} height={{ base: '64px', lg: '128px' }} />

          <Stack align="center" spacing={0} mt={5}>
            <Text fontWeight="bold" fontSize="lg" textAlign="center">
              Something went wrong
            </Text>
            <Text fontSize="sm" variant="faded" textAlign="center">
              The API requests failed.
            </Text>
          </Stack>

          <Stack align="center" spacing={0} mt={10}>
            <Button onClick={() => refetchAll()}>Retry</Button>
          </Stack>
        </Flex>
      )}
    </Box>
  );
}

export default dynamic(() => Promise.resolve(DashboardPage), { ssr: false });
