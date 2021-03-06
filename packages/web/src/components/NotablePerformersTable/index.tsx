import {
  Box,
  Stack,
  Text,
  Table,
  Thead,
  Tr,
  Td,
  Tbody,
  SkeletonCircle,
  HStack,
  Image,
  SimpleGrid,
  GridItem,
  Flex,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { RiSwordLine } from 'react-icons/ri';
import { useRecoilValue } from 'recoil';
import { useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';

import dayjs from '../../services/dayjs';
import { scholarsMap } from '@src/recoil/scholars';
import { useBatchScholar } from '@src/services/hooks/useBatchScholar';
import { Card } from '@components/Card';
import { parseScholarData } from '@src/services/utils/parseScholarData';
import { APIScholarResponse } from '@src/types/api';
import { SlpTrackingButton } from '../ScholarsGrid/Scholar/SlpTrackingButton';

interface NumberMenuProps {
  number: number;
  setNumber: React.Dispatch<React.SetStateAction<number>>;
}

const NumberMenu = ({ number, setNumber }: NumberMenuProps): JSX.Element => {
  return (
    <Menu>
      <MenuButton as={Button} size="sm" variant="outline">
        Show {number} scholars
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => setNumber(5)}>5 scholars</MenuItem>
        <MenuItem onClick={() => setNumber(10)}>10 scholars</MenuItem>
        <MenuItem onClick={() => setNumber(25)}>25 scholars</MenuItem>
      </MenuList>
    </Menu>
  );
};

interface TableComponentProps {
  label: string;
  data: UseQueryResult<APIScholarResponse, unknown>[];
  isLoading: boolean;
}

const TableComponent = ({ label, data, isLoading }: TableComponentProps): JSX.Element => {
  const scholars = useRecoilValue(scholarsMap);

  return (
    <Box>
      <Text px={3} py={2} fontWeight="bold">
        {label}
      </Text>

      {isLoading && (
        <Flex align="center" justify="center" mt={5}>
          <SkeletonCircle />
        </Flex>
      )}

      {!isLoading && !data.length && (
        <Flex align="center" justify="center" mt={5}>
          <Text variant="faded">No data...</Text>
        </Flex>
      )}

      {!isLoading && !!data.length && (
        <Box maxH="300px" overflow="auto">
          <Table size="sm" variant="unstyled" maxH="200px">
            <Thead fontWeight="bold">
              <Tr>
                <Td>Name</Td>
                <Td>per Day</Td>
                <Td>Yesterday</Td>
                <Td>Elo</Td>
                <Td>SLP</Td>
                <Td>History</Td>
              </Tr>
            </Thead>

            <Tbody>
              {data.map(result => {
                const { address } = result.data;
                const state = scholars.find(scholar => scholar.address === address);
                const { yesterdaySlp, slpDay, slp, pvpElo } = parseScholarData({ data: result.data });

                return (
                  <Tr key={address}>
                    <Td>{state.name}</Td>
                    <Td fontWeight="bold">{slpDay}</Td>
                    <Td>{yesterdaySlp ?? '-'}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Icon as={RiSwordLine} />

                        <Text>{pvpElo}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Image src="/images/axies/slp.png" height="14px" alt="slp" />
                        <Text>{slp}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <SlpTrackingButton address={address} onlyIcon />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export const NotablePerformersTable = (): JSX.Element => {
  const scholars = useRecoilValue(scholarsMap);
  const addresses = scholars.map(scholar => scholar.address);

  const [scholarsNumber, setScholarsNumber] = useState(5);

  const { results, isLoading } = useBatchScholar({ addresses });

  const sortedScholars = useMemo(
    () =>
      results
        .filter(result => result.isSuccess)
        .filter(result => {
          const state = scholars.find(scholar => scholar.address === result.data.address);
          return !state.inactive;
        })
        .filter(result => {
          const data = parseScholarData({ data: result.data });
          return data.lastClaim !== 0 && dayjs.utc().isAfter(dayjs.unix(data.lastClaim).add(1, 'day'));
        })
        .sort((a, b) => {
          const aData = parseScholarData({ data: a.data });
          const bData = parseScholarData({ data: b.data });

          if (aData.slpDay > bData.slpDay) return -1;
          if (aData.slpDay < bData.slpDay) return 1;
          return 0;
        }),
    [results, scholars]
  );

  const topScholars = sortedScholars.slice(0, scholarsNumber);
  const bottomScholars = sortedScholars.reverse().slice(0, scholarsNumber);

  return (
    <Stack>
      <Flex justify="space-between">
        <HStack>
          <Text fontWeight="bold" fontSize="lg">
            Notable Performers
          </Text>

          <Tooltip label="The top and bottom performers based on their SLP per day average. Disconsiders the scholars that claimed less than 1 full day ago.">
            <Box>
              <AiOutlineInfoCircle />
            </Box>
          </Tooltip>
        </HStack>

        <NumberMenu number={scholarsNumber} setNumber={setScholarsNumber} />
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={3}>
        <GridItem colSpan={1} minH={64}>
          <Card p={3} h="100%">
            <TableComponent label="Top Performers" data={topScholars} isLoading={isLoading} />
          </Card>
        </GridItem>

        <GridItem colSpan={1} minH={64}>
          <Card p={3} h="100%">
            <TableComponent label="Bottom Performers" data={bottomScholars} isLoading={isLoading} />
          </Card>
        </GridItem>
      </SimpleGrid>
    </Stack>
  );
};
