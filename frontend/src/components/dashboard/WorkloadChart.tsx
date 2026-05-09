import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { WorkerWorkload } from '../../types/manager';

const StyledView = styled(View);
const StyledText = styled(Text);

interface WorkloadChartProps {
  workloads: WorkerWorkload[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ workloads }) => {
  const maxIssues = Math.max(...workloads.map(w => w.assignedIssuesCount), 0) || 1;

  return (
    <StyledView className="bg-white p-4 rounded-lg shadow-md mt-4">
      <StyledText className="text-xl font-bold text-gray-800 mb-4">Worker Workloads</StyledText>
      {workloads.map(workload => (
        <StyledView key={workload.workerId} className="mb-3">
          <StyledView className="flex-row justify-between items-center mb-1">
            <StyledText className="font-semibold text-gray-700">{workload.workerName}</StyledText>
            <StyledText className="font-bold text-blue-600">{workload.assignedIssuesCount}</StyledText>
          </StyledView>
          <StyledView className="h-4 bg-gray-200 rounded-full">
            <StyledView
              className="h-4 bg-blue-500 rounded-full"
              style={{ width: `${(workload.assignedIssuesCount / maxIssues) * 100}%` }}
            />
          </StyledView>
        </StyledView>
      ))}
    </StyledView>
  );
};

export default WorkloadChart;
