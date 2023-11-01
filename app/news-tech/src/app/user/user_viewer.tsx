import { queryClient } from "@/api/query_client";
import { useHnUser } from "@/api/use-hn-user";
import { ExternalLink } from "@/components/ExternalLink";
import { LoadingScreen } from "@/components/loading_screen";
import { QueryClientProvider } from "react-query";

export function UserViewerWrapper(props: { userId: string | null }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserViewer userId={props.userId} />
    </QueryClientProvider>
  );
}

function UserViewer(props: { userId: string | null }) {
  const query = useHnUser(props.userId);

  if (query.isLoading) {
    return <LoadingScreen />;
  }

  if (!props.userId || query.error || !query.data) {
    return <div className="text-center py-10">User not found</div>;
  }

  const data = query.data;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3">
      <div>
        <table>
          <tbody>
            <Row name="user" value={data.username} />
            <Row
              name="about"
              value={<div dangerouslySetInnerHTML={{ __html: data.about }} />}
            />
            <Row name="karma" value={data.karma} />
          </tbody>
        </table>
        <div className="pt-6">
          <ExternalLink
            href={`https://news.ycombinator.com/user?id=${props.userId}`}
          >
            More info on HN
          </ExternalLink>
        </div>
      </div>
    </main>
  );
}

function Row(props: { name: string; value: React.ReactNode }) {
  return (
    <tr className="align-top text-gray-500">
      <td className="pr-3">{props.name}:</td>
      <td>{props.value}</td>
    </tr>
  );
}
