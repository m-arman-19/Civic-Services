import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation & Common Components
import { PublicNavbar } from '../components/common/PublicNavbar';
import { PublicFooter } from '../components/common/PublicFooter';
import { AuthenticatedHeader } from '../components/common/AuthenticatedHeader';
import { Sidebar } from '../components/common/Sidebar';
import { MobileNav } from '../components/common/MobileNav';
import { DevDemoDrawer } from '../components/common/DevDemoDrawer';
import { AskSathiDrawer } from '../components/common/AskSathiDrawer';
import { AuthGuard, RoleGuard } from '../components/common/Guards';

// Public & Citizen Views
import { PublicHomePage } from '../features/public/PublicHomePage';
import { CitizenHomePage } from '../features/citizen/CitizenHomePage';
import { ReportProblemWizard } from '../features/citizen/ReportProblemWizard';
import { CitizenCasesListPage } from '../features/citizen/CitizenCasesListPage';
import { CitizenCaseDetailPage } from '../features/citizen/CitizenCaseDetailPage';
import { ServiceDiscoveryPage } from '../features/citizen/ServiceDiscoveryPage';
import { ServiceDetailPage } from '../features/citizen/ServiceDetailPage';
import { CitizenNotificationsPage } from '../features/citizen/CitizenNotificationsPage';
import { CitizenProfilePage } from '../features/citizen/CitizenProfilePage';

// Ward Views
import { WardDashboardPage } from '../features/ward/WardDashboardPage';
import { WardWorkQueuePage } from '../features/ward/WardWorkQueuePage';
import { WardVerificationQueuePage } from '../features/ward/WardVerificationQueuePage';
import { WardCaseReviewPage } from '../features/ward/WardCaseReviewPage';
import { WardAiReviewHubPage } from '../features/ward/WardAiReviewHubPage';
import { WardRoutingPage } from '../features/ward/WardRoutingPage';
import { WardMultiDeptPlannerPage } from '../features/ward/WardMultiDeptPlannerPage';
import { WardDuplicateManagerPage } from '../features/ward/WardDuplicateManagerPage';
import { WardHandoverPage } from '../features/ward/WardHandoverPage';
import { WardEvidenceReviewPage } from '../features/ward/WardEvidenceReviewPage';
import { WardOperationsMapPage } from '../features/ward/WardOperationsMapPage';
import { WardHotspotsPage } from '../features/ward/WardHotspotsPage';
import { WardSlaEscalationPage } from '../features/ward/WardSlaEscalationPage';
import { WardReportsPage } from '../features/ward/WardReportsPage';
import { WardAssistedHistoryPage } from '../features/ward/WardAssistedHistoryPage';

// Officer Views
import { OfficerDashboardPage } from '../features/officer/OfficerDashboardPage';
import { OfficerTaskDetailPage } from '../features/officer/OfficerTaskDetailPage';
import { OfficerDepartmentRequestsPage } from '../features/officer/OfficerDepartmentRequestsPage';
import { OfficerAssignmentQueuePage } from '../features/officer/OfficerAssignmentQueuePage';
import { OfficerAvailabilityPage } from '../features/officer/OfficerAvailabilityPage';
import { OfficerWorkloadPage } from '../features/officer/OfficerWorkloadPage';
import { OfficerTasksPage } from '../features/officer/OfficerTasksPage';

// Coordinator Views
import { CoordinatorDashboardPage } from '../features/coordinator/CoordinatorDashboardPage';
import { MultiDepartmentCaseViewPage } from '../features/coordinator/MultiDepartmentCaseViewPage';
import { CoordinatorEscalationsPage } from '../features/coordinator/CoordinatorEscalationsPage';
import { CoordinatorHotspotsPage } from '../features/coordinator/CoordinatorHotspotsPage';
import { CoordinatorCaseBoardPage } from '../features/coordinator/CoordinatorCaseBoardPage';
import { CoordinatorMultiDeptListPage } from '../features/coordinator/CoordinatorMultiDeptListPage';
import { CoordinatorSequencePlannerPage } from '../features/coordinator/CoordinatorSequencePlannerPage';
import { CoordinatorHandoversPage } from '../features/coordinator/CoordinatorHandoversPage';
import { CoordinatorWorkloadPage } from '../features/coordinator/CoordinatorWorkloadPage';
import { CoordinatorDuplicatesPage } from '../features/coordinator/CoordinatorDuplicatesPage';
import { CoordinatorEvidenceReviewPage } from '../features/coordinator/CoordinatorEvidenceReviewPage';
import { CoordinatorObjectionsPage } from '../features/coordinator/CoordinatorObjectionsPage';
import { CoordinatorReopenedCasesPage } from '../features/coordinator/CoordinatorReopenedCasesPage';
import { CoordinatorClosureReviewPage } from '../features/coordinator/CoordinatorClosureReviewPage';
import { CoordinatorMapPage } from '../features/coordinator/CoordinatorMapPage';
import { CoordinatorDepartmentPerformancePage } from '../features/coordinator/CoordinatorDepartmentPerformancePage';
import { CoordinatorCaseAuditPage } from '../features/coordinator/CoordinatorCaseAuditPage';
import { CoordinatorSlaTargetsPage } from '../features/coordinator/CoordinatorSlaTargetsPage';

// Admin Views
import { AdminOverviewPage } from '../features/admin/AdminOverviewPage';
import { AdminSystemHealthPage } from '../features/admin/AdminSystemHealthPage';
import { AdminPendingApprovalsPage } from '../features/admin/AdminPendingApprovalsPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { AdminRolesMatrixPage } from '../features/admin/AdminRolesMatrixPage';
import { AdminAccountStatusPage } from '../features/admin/AdminAccountStatusPage';
import { AdminDepartmentDirectoryPage } from '../features/admin/AdminDepartmentDirectoryPage';
import { AdminOfficerDirectoryPage } from '../features/admin/AdminOfficerDirectoryPage';
import { AdminWardAssetRegistryPage } from '../features/admin/AdminWardAssetRegistryPage';
import { AdminRulesPage } from '../features/admin/AdminRulesPage';
import { AdminTaskSequencingRulesPage } from '../features/admin/AdminTaskSequencingRulesPage';
import { AdminAiGatePage } from '../features/admin/AdminAiGatePage';
import { AdminAiSafetyConfigPage } from '../features/admin/AdminAiSafetyConfigPage';
import { AdminServiceKnowledgePage } from '../features/admin/AdminServiceKnowledgePage';
import { AdminServiceSourcesPage } from '../features/admin/AdminServiceSourcesPage';
import { AdminKnowledgeHistoryPage } from '../features/admin/AdminKnowledgeHistoryPage';
import { AdminSlaPoliciesPage } from '../features/admin/AdminSlaPoliciesPage';
import { AdminEscalationConfigPage } from '../features/admin/AdminEscalationConfigPage';
import { AdminPublicDashboardSettingsPage } from '../features/admin/AdminPublicDashboardSettingsPage';
import { AdminAuditLogPage } from '../features/admin/AdminAuditLogPage';
import { AdminSecurityEventsPage } from '../features/admin/AdminSecurityEventsPage';
import { AdminConfigHistoryPage } from '../features/admin/AdminConfigHistoryPage';
import { AdminAnalyticsPage } from '../features/admin/AdminAnalyticsPage';
import { AdminRepeatIssuesPage } from '../features/admin/AdminRepeatIssuesPage';
import { AdminTransparencyMetricsPage } from '../features/admin/AdminTransparencyMetricsPage';
import { AdminSystemSettingsPage } from '../features/admin/AdminSystemSettingsPage';
import { AdminInfrastructureStatusPage } from '../features/admin/AdminInfrastructureStatusPage';
import { AdminTechnicalConfigPage } from '../features/admin/AdminTechnicalConfigPage';
import { AdminPolicyImplementationsPage } from '../features/admin/AdminPolicyImplementationsPage';

// City Governance Head Views (Municipal Policy & Service Governance)
import { GovernanceOverviewPage } from '../features/governance/GovernanceOverviewPage';
import { GovernanceApprovalsPage } from '../features/governance/GovernanceApprovalsPage';
import { GovernanceResponsibilityRulesPage } from '../features/governance/GovernanceResponsibilityRulesPage';
import { GovernanceTaskSequencingPage } from '../features/governance/GovernanceTaskSequencingPage';
import { GovernanceAiGatePage } from '../features/governance/GovernanceAiGatePage';
import { GovernanceSlaPolicyPage } from '../features/governance/GovernanceSlaPolicyPage';
import { GovernanceServicePerformancePage } from '../features/governance/GovernanceServicePerformancePage';
import { GovernanceRecurringIssuesPage } from '../features/governance/GovernanceRecurringIssuesPage';
import { GovernanceTransparencyPolicyPage } from '../features/governance/GovernanceTransparencyPolicyPage';
import { GovernancePolicyHistoryPage } from '../features/governance/GovernancePolicyHistoryPage';

// Maps & Transparency & Auth
import { CivicMapPage } from '../features/maps/CivicMapPage';
import { PublicTransparencyPage } from '../features/transparency/PublicTransparencyPage';
import { RoleSelectionPage } from '../features/auth/RoleSelectionPage';
import { RoleLoginPage } from '../features/auth/RoleLoginPage';
import { UnauthorizedPage } from '../features/auth/UnauthorizedPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, activeRole } = useAuth();
  const isStaffOrAdmin = isAuthenticated && activeRole !== 'citizen';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--ink)] selection:text-[var(--paper)] pb-16 md:pb-0 transition-colors duration-200">
      {/* Dynamic Header */}
      {!isAuthenticated ? <PublicNavbar /> : <AuthenticatedHeader />}

      {/* Main Workspace Layout with Sidebar for Staff/Admin */}
      <div className="flex-1 flex w-full">
        {isStaffOrAdmin && <Sidebar />}

        <main className="flex-1 min-w-0 overflow-y-auto">
          <Routes>
            {/* Public Entry & General Routes */}
            <Route
              path="/"
              element={!isAuthenticated ? <PublicHomePage /> : activeRole === 'citizen' ? <CitizenHomePage /> : <Navigate to={getRoleRedirect(activeRole || 'citizen')} replace />}
            />
            <Route
              path="/home"
              element={
                <AuthGuard>
                  <CitizenHomePage />
                </AuthGuard>
              }
            />
            <Route path="/services" element={<ServiceDiscoveryPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/map" element={<CivicMapPage />} />
            <Route path="/transparency" element={<PublicTransparencyPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Navigate to="/login/citizen" replace />} />
            <Route path="/login/:role" element={<RoleLoginPage />} />
            <Route path="/roles" element={<RoleSelectionPage />} />
            <Route path="/login/roles" element={<RoleSelectionPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/forbidden" element={<UnauthorizedPage />} />

            {/* Citizen Protected Routes */}
            <Route
              path="/report"
              element={
                <AuthGuard>
                  <ReportProblemWizard />
                </AuthGuard>
              }
            />
            <Route
              path="/cases"
              element={
                <AuthGuard>
                  <CitizenCasesListPage />
                </AuthGuard>
              }
            />
            <Route
              path="/cases/:id"
              element={
                <AuthGuard>
                  <CitizenCaseDetailPage />
                </AuthGuard>
              }
            />
            <Route
              path="/notifications"
              element={
                <AuthGuard>
                  <CitizenNotificationsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <CitizenProfilePage />
                </AuthGuard>
              }
            />

            {/* Ward Desk Protected Routes */}
            {/* Overview */}
            <Route
              path="/ward"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/work-queue"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardWorkQueuePage />
                </RoleGuard>
              }
            />

            {/* Case Operations */}
            <Route
              path="/ward/verification"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardVerificationQueuePage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/cases/:id"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardCaseReviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/ai-review"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardAiReviewHubPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/routing"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardRoutingPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/planner"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardMultiDeptPlannerPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/duplicates"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardDuplicateManagerPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/handovers"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardHandoverPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/evidence-review"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardEvidenceReviewPage />
                </RoleGuard>
              }
            />

            {/* Ward Intelligence */}
            <Route
              path="/ward/map"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardOperationsMapPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/hotspots"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardHotspotsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/sla-escalations"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardSlaEscalationPage />
                </RoleGuard>
              }
            />

            {/* Reports */}
            <Route
              path="/ward/reports"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardReportsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/assisted-history"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardAssistedHistoryPage />
                </RoleGuard>
              }
            />

            {/* Officer Protected Routes */}
            <Route
              path="/officer"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/requests"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerDepartmentRequestsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/assignment-queue"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerAssignmentQueuePage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/availability"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerAvailabilityPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/workload"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerWorkloadPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/tasks"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerTasksPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/tasks/:id"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerTaskDetailPage />
                </RoleGuard>
              }
            />

            {/* Coordinator Protected Routes */}
            <Route
              path="/coordinator"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/cases"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorCaseBoardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/cases/:id"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <MultiDepartmentCaseViewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/multi-dept"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorMultiDeptListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/sequence-planner"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorSequencePlannerPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/handovers"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorHandoversPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/workload"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorWorkloadPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/duplicates"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorDuplicatesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/evidence-review"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorEvidenceReviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/objections"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorObjectionsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/reopened-cases"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorReopenedCasesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/closure-review"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorClosureReviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/escalations"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorEscalationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/map"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorMapPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/hotspots"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorHotspotsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/department-performance"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorDepartmentPerformancePage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/case-audit"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorCaseAuditPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/sla-targets"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorSlaTargetsPage />
                </RoleGuard>
              }
            />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminOverviewPage /></RoleGuard>} />
            <Route path="/admin/health" element={<RoleGuard allowedRoles={['admin']}><AdminSystemHealthPage /></RoleGuard>} />
            <Route path="/admin/infrastructure" element={<RoleGuard allowedRoles={['admin']}><AdminInfrastructureStatusPage /></RoleGuard>} />
            <Route path="/admin/technical-config" element={<RoleGuard allowedRoles={['admin']}><AdminTechnicalConfigPage /></RoleGuard>} />
            <Route path="/admin/policy-implementations" element={<RoleGuard allowedRoles={['admin']}><AdminPolicyImplementationsPage /></RoleGuard>} />
            <Route path="/admin/pending-approvals" element={<RoleGuard allowedRoles={['admin']}><AdminPendingApprovalsPage /></RoleGuard>} />

            {/* Admin Identity & Registry */}
            <Route path="/admin/users" element={<RoleGuard allowedRoles={['admin']}><AdminUsersPage /></RoleGuard>} />
            <Route path="/admin/roles" element={<RoleGuard allowedRoles={['admin']}><AdminRolesMatrixPage /></RoleGuard>} />
            <Route path="/admin/accounts" element={<RoleGuard allowedRoles={['admin']}><AdminAccountStatusPage /></RoleGuard>} />
            <Route path="/admin/departments" element={<RoleGuard allowedRoles={['admin']}><AdminDepartmentDirectoryPage /></RoleGuard>} />
            <Route path="/admin/officers" element={<RoleGuard allowedRoles={['admin']}><AdminOfficerDirectoryPage /></RoleGuard>} />
            <Route path="/admin/registry" element={<RoleGuard allowedRoles={['admin']}><AdminWardAssetRegistryPage /></RoleGuard>} />

            {/* Admin Audit & Diagnostics */}
            <Route path="/admin/audit" element={<RoleGuard allowedRoles={['admin']}><AdminAuditLogPage /></RoleGuard>} />
            <Route path="/admin/security-events" element={<RoleGuard allowedRoles={['admin']}><AdminSecurityEventsPage /></RoleGuard>} />
            <Route path="/admin/config-history" element={<RoleGuard allowedRoles={['admin']}><AdminConfigHistoryPage /></RoleGuard>} />
            <Route path="/admin/settings" element={<RoleGuard allowedRoles={['admin']}><AdminSystemSettingsPage /></RoleGuard>} />

            {/* City Governance Head Protected Routes (Municipal Policy & Service Governance) */}
            <Route path="/governance" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceOverviewPage /></RoleGuard>} />
            <Route path="/governance/approvals" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceApprovalsPage /></RoleGuard>} />
            <Route path="/governance/responsibility-rules" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceResponsibilityRulesPage /></RoleGuard>} />
            <Route path="/governance/task-sequencing" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceTaskSequencingPage /></RoleGuard>} />
            <Route path="/governance/ai-gate" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceAiGatePage /></RoleGuard>} />
            <Route path="/governance/sla-policy" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceSlaPolicyPage /></RoleGuard>} />
            <Route path="/governance/service-performance" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceServicePerformancePage /></RoleGuard>} />
            <Route path="/governance/recurring-issues" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceRecurringIssuesPage /></RoleGuard>} />
            <Route path="/governance/transparency-policy" element={<RoleGuard allowedRoles={['governance_head']}><GovernanceTransparencyPolicyPage /></RoleGuard>} />
            <Route path="/governance/history" element={<RoleGuard allowedRoles={['governance_head']}><GovernancePolicyHistoryPage /></RoleGuard>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation for Authenticated Citizens */}
      {isAuthenticated && activeRole === 'citizen' && <MobileNav />}

      {/* Public Footer for Non-authenticated Visitors or Citizen Pages */}
      {!isStaffOrAdmin && <PublicFooter />}

      {/* Sathi AI Floating Assistant Drawer */}
      <AskSathiDrawer />

      {/* Developer Demo Mode Drawer */}
      <DevDemoDrawer />
    </div>
  );
};

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'ward_desk':
      return '/ward';
    case 'field_officer':
      return '/officer';
    case 'coordinator':
      return '/coordinator';
    case 'governance_head':
      return '/governance';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}
