
import { UiLayout } from '@/components/ui/ui-layout';


const links: { label: string; path: string }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
  { label: 'Profile Program', path: '/profile' },
  { label: 'User', path: '/user' },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
        <UiLayout links={links}>{children}</UiLayout>
   </div>
  );
}
