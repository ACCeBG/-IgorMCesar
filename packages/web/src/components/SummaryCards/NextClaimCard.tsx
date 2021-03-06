import { Stat, StatLabel, StatNumber, StatHelpText, Skeleton } from '@chakra-ui/react';
import { UseQueryResult } from 'react-query';
import { Dayjs } from 'dayjs';

import dayjs from '../../services/dayjs';
import { Card } from '@components/Card';
import { APIScholarResponse } from '@src/types/api';

interface NextClaimCardProps {
  data: UseQueryResult<APIScholarResponse>[];
  isLoading: boolean;
}

export const NextClaimCard = ({ data, isLoading }: NextClaimCardProps): JSX.Element => {
  const closestClaim = data
    .filter(result => result.isSuccess)
    .reduce((prev, currResult) => {
      const { lastClaim } = currResult.data.scholar;
      const nextClaimDate = dayjs.unix(lastClaim).add(14, 'days');
      if (lastClaim === 0) return prev;
      if (!prev) return nextClaimDate;

      if (nextClaimDate.isBefore(dayjs(prev))) return nextClaimDate;
      return prev;
    }, null as Dayjs | null);

  const closestClaimRelativeText = dayjs(closestClaim).isBefore(dayjs()) ? 'now' : dayjs(closestClaim).fromNow();
  const closestClaimDateText = dayjs(closestClaim).format('DD MMM YYYY, HH:mm:ss');

  return (
    <Card p={3}>
      <Stat>
        <StatLabel>Your next claim is</StatLabel>

        <StatNumber>
          <Skeleton isLoaded={!isLoading} h="35px" w="250px">
            {closestClaim ? closestClaimRelativeText : '-'}
          </Skeleton>
        </StatNumber>

        <Skeleton isLoaded={!isLoading} h="20px" w="200px" mt={1}>
          <StatHelpText>{closestClaim ? closestClaimDateText : '-'}</StatHelpText>
        </Skeleton>
      </Stat>
    </Card>
  );
};
