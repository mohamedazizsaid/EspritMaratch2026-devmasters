/**
 * Service Configuration Test
 * Verify that all services are properly set up and ready to use
 */

import {
  API_CONFIG,
  authService,
  elevesService,
  formationService,
  inscriptionService,
  presenceService,
  certificationService,
  chatbotService,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getHeaders,
  getApiUrl,
} from './index';

export interface ServiceTest {
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export const runServiceTests = (): ServiceTest[] => {
  const tests: ServiceTest[] = [];

  // Test 1: Config is loaded
  tests.push({
    name: 'API Configuration',
    status: API_CONFIG.BASE_URL ? 'PASS' : 'FAIL',
    details: `Base URL: ${API_CONFIG.BASE_URL || 'NOT SET'}`,
  });

  // Test 2: Auth endpoints are defined
  tests.push({
    name: 'Auth Endpoints',
    status:
      API_CONFIG.AUTH.REGISTER &&
      API_CONFIG.AUTH.LOGIN &&
      API_CONFIG.AUTH.LOGOUT &&
      API_CONFIG.AUTH.ME
        ? 'PASS'
        : 'FAIL',
    details: `Register: ${API_CONFIG.AUTH.REGISTER}, Login: ${API_CONFIG.AUTH.LOGIN}`,
  });

  // Test 3: Eleves endpoints are defined
  tests.push({
    name: 'Eleves Endpoints',
    status:
      API_CONFIG.ELEVES.LIST &&
      API_CONFIG.ELEVES.CREATE &&
      typeof API_CONFIG.ELEVES.GET === 'function'
        ? 'PASS'
        : 'FAIL',
    details: `List: ${API_CONFIG.ELEVES.LIST}, Create: ${API_CONFIG.ELEVES.CREATE}`,
  });

  // Test 4: Formation endpoints are defined
  tests.push({
    name: 'Formation Endpoints',
    status:
      API_CONFIG.FORMATION.LIST &&
      API_CONFIG.FORMATION.CREATE &&
      typeof API_CONFIG.FORMATION.GET === 'function'
        ? 'PASS'
        : 'FAIL',
    details: `List: ${API_CONFIG.FORMATION.LIST}, Create: ${API_CONFIG.FORMATION.CREATE}`,
  });

  // Test 5: Inscription endpoints are defined
  tests.push({
    name: 'Inscription Endpoints',
    status:
      API_CONFIG.INSCRIPTION.LIST &&
      API_CONFIG.INSCRIPTION.CREATE &&
      typeof API_CONFIG.INSCRIPTION.GET === 'function'
        ? 'PASS'
        : 'FAIL',
    details: `List: ${API_CONFIG.INSCRIPTION.LIST}, Create: ${API_CONFIG.INSCRIPTION.CREATE}`,
  });

  // Test 6: Presence endpoints are defined
  tests.push({
    name: 'Presence Endpoints',
    status:
      API_CONFIG.PRESENCE.CREATE &&
      typeof API_CONFIG.PRESENCE.BY_SEANCE === 'function'
        ? 'PASS'
        : 'FAIL',
    details: `Create: ${API_CONFIG.PRESENCE.CREATE}`,
  });

  // Test 7: Certification endpoints are defined
  tests.push({
    name: 'Certification Endpoints',
    status:
      API_CONFIG.CERTIFICATION.LIST &&
      API_CONFIG.CERTIFICATION.CREATE &&
      typeof API_CONFIG.CERTIFICATION.GET === 'function'
        ? 'PASS'
        : 'FAIL',
    details: `List: ${API_CONFIG.CERTIFICATION.LIST}, Create: ${API_CONFIG.CERTIFICATION.CREATE}`,
  });

  // Test 8: Chatbot endpoints are defined
  tests.push({
    name: 'Chatbot Endpoints',
    status:
      API_CONFIG.CHATBOT.ASK &&
      API_CONFIG.CHATBOT.ANALYZE_IMAGE &&
      API_CONFIG.CHATBOT.UPLOAD_ANALYZE &&
      typeof API_CONFIG.CHATBOT.FORMATION_HISTORY === 'function'
        ? 'PASS'
        : 'FAIL',
    details: `Ask: ${API_CONFIG.CHATBOT.ASK}, Upload: ${API_CONFIG.CHATBOT.UPLOAD_ANALYZE}`,
  });

  // Test 9: Auth service methods
  tests.push({
    name: 'Auth Service Methods',
    status:
      typeof authService.login === 'function' &&
      typeof authService.register === 'function' &&
      typeof authService.logout === 'function' &&
      typeof authService.getMe === 'function' &&
      typeof authService.isAuthenticated === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 5 methods available',
  });

  // Test 10: Eleves service methods
  tests.push({
    name: 'Eleves Service Methods',
    status:
      typeof elevesService.create === 'function' &&
      typeof elevesService.findAll === 'function' &&
      typeof elevesService.findOne === 'function' &&
      typeof elevesService.update === 'function' &&
      typeof elevesService.remove === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 5 methods available',
  });

  // Test 11: Formation service methods
  tests.push({
    name: 'Formation Service Methods',
    status:
      typeof formationService.create === 'function' &&
      typeof formationService.findAll === 'function' &&
      typeof formationService.findOne === 'function' &&
      typeof formationService.remove === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 4 methods available',
  });

  // Test 12: Inscription service methods
  tests.push({
    name: 'Inscription Service Methods',
    status:
      typeof inscriptionService.create === 'function' &&
      typeof inscriptionService.findAll === 'function' &&
      typeof inscriptionService.findOne === 'function' &&
      typeof inscriptionService.updateStatus === 'function' &&
      typeof inscriptionService.remove === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 5 methods available',
  });

  // Test 13: Presence service methods
  tests.push({
    name: 'Presence Service Methods',
    status:
      typeof presenceService.markPresence === 'function' &&
      typeof presenceService.findBySeance === 'function' &&
      typeof presenceService.update === 'function' &&
      typeof presenceService.remove === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 4 methods available',
  });

  // Test 14: Certification service methods
  tests.push({
    name: 'Certification Service Methods',
    status:
      typeof certificationService.create === 'function' &&
      typeof certificationService.findAll === 'function' &&
      typeof certificationService.findOne === 'function' &&
      typeof certificationService.downloadPdf === 'function' &&
      typeof certificationService.downloadPdfFile === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 5+ methods available',
  });

  // Test 15: Chatbot service methods
  tests.push({
    name: 'Chatbot Service Methods',
    status:
      typeof chatbotService.ask === 'function' &&
      typeof chatbotService.analyzeImage === 'function' &&
      typeof chatbotService.uploadAndAnalyze === 'function' &&
      typeof chatbotService.getHistory === 'function' &&
      typeof chatbotService.getFormationHistory === 'function' &&
      typeof chatbotService.deleteChatRecord === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All 6 methods available',
  });

  // Test 16: Token management
  tests.push({
    name: 'Token Management',
    status:
      typeof getAuthToken === 'function' &&
      typeof setAuthToken === 'function' &&
      typeof clearAuthToken === 'function'
        ? 'PASS'
        : 'FAIL',
    details: 'All token functions available',
  });

  // Test 17: Header generation
  tests.push({
    name: 'Header Generation',
    status:
      typeof getHeaders === 'function' &&
      (getHeaders() as Record<string, string>)['Content-Type'] === 'application/json'
        ? 'PASS'
        : 'FAIL',
    details: 'Headers generated correctly',
  });

  // Test 18: URL generation
  tests.push({
    name: 'URL Generation',
    status:
      typeof getApiUrl === 'function' &&
      getApiUrl('/test').includes(API_CONFIG.BASE_URL)
        ? 'PASS'
        : 'FAIL',
    details: `Generated URL: ${getApiUrl('/test')}`,
  });

  return tests;
};

// Export test runner component for React
export function ServiceHealthCheck() {
  const tests = runServiceTests();
  const passCount = tests.filter((t) => t.status === 'PASS').length;
  const totalCount = tests.length;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Service Health Check</h2>
      <p>
        Status: {passCount}/{totalCount} tests passed
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '15px',
        }}
      >
        {tests.map((test, index) => (
          <div
            key={index}
            style={{
              padding: '10px',
              border: `2px solid ${test.status === 'PASS' ? '#4ade80' : '#f87171'}`,
              borderRadius: '4px',
              backgroundColor:
                test.status === 'PASS'
                  ? 'rgba(74, 222, 128, 0.1)'
                  : 'rgba(248, 113, 113, 0.1)',
            }}
          >
            <div>
              <strong>{test.name}</strong>
              <span style={{ marginLeft: '10px' }}>
                {test.status === 'PASS' ? '✅' : '❌'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {test.details}
            </div>
          </div>
        ))}
      </div>

      {passCount === totalCount && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#dcfce7',
            borderRadius: '4px',
            color: '#166534',
          }}
        >
          ✅ All services are correctly configured and ready to use!
        </div>
      )}

      {passCount < totalCount && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fee2e2',
            borderRadius: '4px',
            color: '#991b1b',
          }}
        >
          ⚠️ Some services need attention. Please check the configuration.
        </div>
      )}
    </div>
  );
}

export default ServiceHealthCheck;
