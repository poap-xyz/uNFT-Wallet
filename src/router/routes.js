const routes = [
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('pages/Welcome/Welcome'),
  },
  {
    path: '/single/:chainId/:contractAddress/:tokenId',
    name: 'single',
    component: () => import('pages/Single'),
    props: true,
  },

  { path: '/', name: 'main', component: () => import('pages/Index') },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404'),
  },
];

export default routes;
