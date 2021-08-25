const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      { path: '', name: 'main', component: () => import('pages/Index') },
      {
        path: 'welcome',
        name: 'welcome',
        component: () => import('pages/Welcome/Welcome'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404'),
  },
];

export default routes;
