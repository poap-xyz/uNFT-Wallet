const routes = [
  {
    path: '/welcome',
    name: 'welcome-page',
    component: () => import('pages/WelcomePage/WelcomePage'),
  },
  {
    path: '/single/:chainId/:contractAddress/:tokenId',
    name: 'single-page',
    component: () => import('pages/Single'),
    props: true,
  },

  { path: '/', name: 'main-page', component: () => import('pages/Index') },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404Page'),
  },
];

export default routes;
