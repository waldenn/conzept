"use client";
import { QueryClientProvider } from "react-query";
import { queryClient } from "@/api/query_client";
import {
  FrontPageQuery,
  StoryFrontPageJson,
  StoryItem,
  useHnPage,
} from "@/api/use-hn-page";
import { FrontPageViewer } from "./FrontPageViewer";
import { FrontPageFooter } from "./FrontPageFooter";
import { LoadingScreen } from "./loading_screen";
import { RadioButton } from "./RadioButton";
import React, { useState } from "react";
import { useSetUrlQueryParams } from "./usePageFromParams";
import {
  add24Hours,
  dateToHnSeconds,
  getNowMinus,
  minus24Hours,
  secondsToDateString,
  todayDateString,
} from "./time";

export function FrontPageViewerWrapper(props: FrontPageQuery) {
  return (
    <QueryClientProvider client={queryClient}>
      <PageViewer {...props} />
    </QueryClientProvider>
  );
}

function PageViewer(props: FrontPageQuery) {
  const query = useHnPage(props);
  const [sortValue, setSortValue] = useState(SortOption.byPoints);
  const sorted = useFrontPageSort(query.data, sortValue);
  const { patchQueryParams } = useSetUrlQueryParams();
  if (query.isLoading) {
    return <LoadingScreen />;
  }
  if (query.status === "error") {
    return <div>Problem loading data, err: {query.error + ""}</div>;
  }
  if (!query.data || !sorted) {
    return <div>No data?...</div>;
  }
  const isNotFrontPage = props.tag !== "front_page";
  const dateButtons = isNotFrontPage && (
    <DateButtons
      createdBeforeI={props.createdBeforeI}
      onClickYesterday={() => {
        const newBefore = minus24Hours(props.createdBeforeI);
        patchQueryParams({
          createdAfterI: minus24Hours(newBefore),
          createdBeforeI: newBefore,
          page: 1,
        });
      }}
      onClickTomorrow={() => {
        patchQueryParams({
          createdAfterI: props.createdBeforeI,
          createdBeforeI: add24Hours(props.createdBeforeI),
          page: 1,
        });
      }}
    />
  );
  return (
    <div className="flex flex-col w-full">
      <div className="pb-3">{dateButtons}</div>
      <SortOptions value={sortValue} onChange={setSortValue} />
      <FrontPageViewer data={sorted} />
      <FrontPageFooter pageCount={query.data.nbPages} />
      <table>
        <tbody>
          <OptionRow
            label="Per page"
            option={
              <PerPageOptions
                value={props.pageSize}
                onChange={(perPage) => patchQueryParams({ perPage })}
              />
            }
          />
          {isNotFrontPage && (
            <OptionRow
              label="Date"
              option={
                <DateSelect
                  valueDateString={secondsToDateString(props.createdBeforeI)}
                  onChange={(newTime) =>
                    patchQueryParams({
                      createdAfterI: minus24Hours(newTime),
                      createdBeforeI: newTime,
                      page: 1,
                    })
                  }
                />
              }
            />
          )}
          {isNotFrontPage && <OptionRow label="" option={dateButtons} />}
        </tbody>
      </table>
    </div>
  );
}

function OptionRow(props: { label: string; option: React.ReactNode }) {
  return (
    <tr className="py-1">
      <td className="pr-2 w-24">{props.label}</td>
      <td className="">{props.option}</td>
    </tr>
  );
}

function PerPageOptions(props: {
  value: number;
  onChange: (newPerPage: number) => void;
}) {
  return (
    <select
      value={props.value}
      className="border border-gray-300 p-1"
      onChange={(e) => props.onChange(parseInt(e.target.value))}
    >
      <option>50</option>
      <option>100</option>
    </select>
  );
}

const today = todayDateString();

function DateSelect(props: {
  valueDateString: string;
  onChange: (newTimeSeconds: number) => void;
}) {
  const onInput = (date: string) => {
    props.onChange(dateToHnSeconds(new Date(date)));
  };
  return (
    <input
      type="date"
      value={props.valueDateString || today}
      onChange={(e) => onInput(e.target.value)}
    />
  );
}

function DateButtons(props: {
  createdBeforeI: number;
  onClickTomorrow: () => void;
  onClickYesterday: () => void;
}) {
  const hasTomorrow = React.useMemo(() => {
    const dayBeforeToday = getNowMinus(1, "day");
    const hasTomorrow = props.createdBeforeI < dayBeforeToday;
    return hasTomorrow;
  }, [props.createdBeforeI]);

  return (
    <div className="flex justify-between underline">
      <button onClick={props.onClickYesterday}>Previous Day</button>
      {hasTomorrow ? (
        <button onClick={props.onClickTomorrow}>Next Day</button>
      ) : (
        <div />
      )}
    </div>
  );
}

function useFrontPageSort(
  data: StoryFrontPageJson | undefined,
  sortValue: SortOption
): StoryFrontPageJson | undefined {
  if (!data) {
    return undefined;
  }
  const sortFn =
    sortValue === SortOption.byPoints ? sortByPoints : sortByComments;
  const hitsSorted = [...data.hits].sort(sortFn);
  return {
    ...data,
    hits: hitsSorted,
  };
}

function sortByPoints(item1: StoryItem, item2: StoryItem): number {
  return item2.points - item1.points;
}

function sortByComments(item1: StoryItem, item2: StoryItem): number {
  return item2.num_comments - item1.num_comments;
}

const enum SortOption {
  byPoints = "Sort by points",
  byComments = "Sort by comments",
}

function SortOptions(props: {
  value: SortOption | undefined;
  onChange: (value: SortOption) => void;
}) {
  const options: SortOption[] = [SortOption.byPoints, SortOption.byComments];

  return (
    <div className="flex items-center gap-2 border border-gray-300 p-2 rounded mb-2">
      {options.map((option) => (
        <RadioButton
          key={option}
          value={option}
          label={option}
          checked={option === props.value}
          onChange={(e) => props.onChange(option)}
        />
      ))}
    </div>
  );
}
