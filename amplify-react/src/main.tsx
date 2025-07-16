import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { parseAmplifyConfig } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

import outputs from '../amplify_outputs.json';

import './index.css';
import App from './App.tsx';
import { authModeMap } from './constants/graphql.ts';

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure(outputs);

// Amplify.configure({
//   ...amplifyConfig,
//   API: {
//     GraphQL: {
//       endpoint: outputs.data.url,
//       region: outputs.data.aws_region,
//       defaultAuthMode: authModeMap[outputs.data.default_authorization_type],
//     },
//   },
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
