import React, { useEffect } from 'react';
import { ScrollView, RefreshControl, View, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useManagerStore } from '../../store/managerStore';
import KpiCard from './KpiCard';
import WorkloadChart from './WorkloadChart';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);

const ManagerDashboard: React.FC = () => {
  const { kpis, workloads, isLoading, error, fetchDashboardData } = useManagerStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading && (!kpis || !workloads)) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 justify-center items-center p-4">
        <StyledText className="text-red-500 text-center">{error}</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledScrollView
      className="flex-1 p-4 bg-gray-100"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />}
    >
      <StyledText className="text-2xl font-bold text-gray-800 mb-4">Manager Dashboard</StyledText>
      
      {kpis && (
        <>
          <StyledView className="flex-row justify-between mb-2">
            <KpiCard title="Total Issues" value={kpis.totalIssues} />
            <KpiCard title="Open Issues" value={kpis.openIssues} />
          </StyledView>
          <StyledView className="flex-row justify-between mb-4">
            <KpiCard title="In Progress" value={kpis.inProgressIssues} />
            <KpiCard title="Resolved Today" value={kpis.resolvedToday} />
          </StyledView>
        </>
      )}

      {workloads && workloads.length > 0 && <WorkloadChart workloads={workloads} />}
    </StyledScrollView>
  );
};

export default ManagerDashboard;
