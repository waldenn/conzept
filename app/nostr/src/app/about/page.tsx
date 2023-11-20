import { relays, searchRelays } from "@/lib/config";

export default function Home() {
  return (
    <main>
      <div className="container mx-auto mt-5 px-2 prose break-words">
        <h1>About</h1>

        <p>
          <strong>⚠Everything is fairly experimental.⚠</strong>
        </p>

        <h2>nos.today</h2>

        <p>
          nos.today is a Nostr search web client.{" "}
          <a href="https://github.com/darashi/nos.today">
            https://github.com/darashi/nos.today
          </a>
        </p>

        <p>Events are retrieved from the following relays:</p>

        <ul>
          {relays.map((relay: string) => (
            <li key={relay}>
              {relay}{" "}
              {searchRelays.includes(relay) && (
                <span>
                  <strong>(NIP-50 supported)</strong>
                </span>
              )}
            </li>
          ))}
        </ul>

        <h2>search.nos.today</h2>

        <p>
          <strong>wss://search.nos.today</strong> is an experimental instance of
          searchnos, a pseudo-relay that supports NIP-50.{" "}
          <a href="https://github.com/darashi/searchnos">
            https://github.com/darashi/searchnos
          </a>
        </p>

        <p>
          It is a fairly experimental instance, so event coverage is not
          sufficient (especially for older ones).
        </p>

        <hr />

        <p>
          nos.today and search.nos.today are built by{" "}
          <a href="nostr:npub1q7qyk7rvdga5qzmmyrvmlj29qd0n45snmfuhkrzsj4rk0sm4c4psvqwt9c">
            @darashi
          </a>
          . npub1q7qyk7rvdga5qzmmyrvmlj29qd0n45snmfuhkrzsj4rk0sm4c4psvqwt9c
        </p>
      </div>
    </main>
  );
}
