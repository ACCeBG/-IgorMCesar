import { Box, Spinner, Text, Flex, HStack, Alert, AlertDescription, AlertIcon } from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { useState } from 'react';

import { APIBattlesResponse } from '../../types/api';
import { serverApi } from '../../services/api';
import { BattlesTable } from './BattlesTable';
import { BattleTypeSelector } from './BattleTypeSelector';
import { BattleRowsPerPageSelector } from './BattleRowsPerPageSelector';
import { BattlesWinrate } from './BattlesWinrate';

type BattleType = 'All' | 'PVP' | 'PVE';

interface BattlesModalProps {
  address: string;
}

export const BattlesModal = ({ address }: BattlesModalProps): JSX.Element => {
  const [type, setType] = useState<BattleType>('All');
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, isError } = useQuery(
    ['matches', address],
    async () => {
      const response = await serverApi.get<APIBattlesResponse>('/matches', {
        params: {
          address,
        },
      });

      return response.data;
    },
    { staleTime: 1000 * 60 * 5 }
  );

  if (isLoading) {
    return (
      <Flex justify="center" minH="100px">
        <Spinner />
      </Flex>
    );
  }

  if (isError || !data) {
    return (
      <Flex>
        <Text>Something went wrong</Text>
      </Flex>
    );
  }

  return (
    <Box minH="240px">
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          The recent update broke this feature. Since 28th October, you can&apos;t watch matches and the list won&apos;t
          be updated anymore.
        </AlertDescription>
      </Alert>

      <Flex align="center" justify="space-between" my={3}>
        <Text fontSize="lg">Total of {data.items.length} battles</Text>

        <HStack>
          <BattlesWinrate address={address} data={data} />

          <BattleRowsPerPageSelector value={perPage} onChange={setPerPage} />

          <BattleTypeSelector value={type} onChange={selected => setType((selected as BattleType) ?? 'All')} />
        </HStack>
      </Flex>

      <BattlesTable data={data?.items} address={address} type={type} perPage={perPage} />
    </Box>
  );
};
