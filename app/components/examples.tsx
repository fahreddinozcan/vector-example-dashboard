"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { Empty, Input, Select, Space, Tag } from "antd";
import Fuse from "fuse.js";
import vectorExamples from "@/public/data/vector-examples.json";

import { cx } from "@/lib/utils";

type Tag = { type: string; text: string };
type Example = {
  title: string;
  description: string;
  tags: {
    type: string;
    text: string;
  }[];
  link: string;
};

type Search = {
  tags: Tag[];
};

export const Examples = () => {
  const [search, setSearch] = useState<Search | null>({ tags: [] });
  const [list, setList] = useState<Example[]>(vectorExamples.list);

  const handleSelectedTags = (selectedTag: Tag) => {
    setSearch((prevState) => {
      if (prevState) {
        // Check if the tag is already in the state
        const tagExists = prevState?.tags.some(
          (tag) => tag.text === selectedTag.text
        );

        return {
          ...prevState,
          // If the tag exists, remove it; otherwise, add it
          tags: tagExists
            ? prevState?.tags.filter((tag) => tag.text !== selectedTag.text)
            : [...(prevState?.tags ?? []), selectedTag],
        };
      }
      return null;
    });
  };

  const handleTagSearch = () => {
    if (!search || search.tags.length === 0) {
      setList(vectorExamples.list);
      return;
    }

    const filterByTags = (examples: Example[], tags: Tag[]) => {
      return examples.filter((example) =>
        tags.every((searchTag) =>
          example.tags.some((tag) => tag.text === searchTag.text)
        )
      );
    };

    const filteredList = search?.tags.length
      ? filterByTags(vectorExamples.list, search.tags)
      : vectorExamples.list;

    setList(filteredList);
  };

  useEffect(handleTagSearch, [search?.tags]);

  const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
    const fuse = getFuse(list);
    const searchData = fuse.search(e.currentTarget?.value);
    const filteredList = searchData.map((o) => o.item);
    setList(filteredList);
  };

  return (
    <div className="mt-8 flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        <Input
          name="vector"
          allowClear
          className=" !border-zinc-300 focus:ring-green-600"
          prefix={<IconSearch color="#A1A1AA" strokeWidth="1.5" size="20" />}
          placeholder={"Search"}
          onChange={handleQuery}
          style={{
            width: "200px",
            boxShadow: "0px 1px 1px 0px #0000000D",
          }}
        />

        <Space.Compact className="vector-examples">
          <Input
            style={{ width: "65px", boxShadow: "0px 1px 1px 0px #0000000D" }}
            defaultValue="Models"
            disabled
            className="pointer-events-none !border-zinc-300  disabled:!text-zinc-600"
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Select"
            suffixIcon={
              <IconChevronDown size="20" color="#A1A1AA" strokeWidth="1" />
            }
            value={search?.tags
              .filter((tag) => tag.type === "model")
              .map((tag) => tag.text)}
            style={{
              minWidth: "200px",
              boxShadow: "0px 1px 1px 0px #0000000D",
            }}
            options={vectorExamples.models.map((model) => ({
              value: model,
              label: model,
            }))}
            onDeselect={(tag) => {
              handleSelectedTags({ type: "model", text: tag });
            }}
            onSelect={(tag) => {
              handleSelectedTags({ type: "model", text: tag });
            }}
          />
        </Space.Compact>
        <Space.Compact className="vector-examples">
          <Input
            style={{ width: "60px", boxShadow: "0px 1px 1px 0px #0000000D" }}
            defaultValue="Stack"
            disabled
            className="pointer-events-none disabled:!text-zinc-600"
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Select"
            className="vector-example-dropdown"
            suffixIcon={
              <IconChevronDown size="20" color="#A1A1AA" strokeWidth="1" />
            }
            value={search?.tags
              .filter((tag) => tag.type === "stack")
              .map((tag) => tag.text)}
            style={{
              minWidth: "120px",
              boxShadow: "0px 1px 1px 0px #0000000D",
            }}
            options={vectorExamples.stacks.map((stack) => ({
              value: stack,
              label: stack,
            }))}
            onDeselect={(tag) => {
              handleSelectedTags({ type: "stack", text: tag });
            }}
            onSelect={(tag) => {
              handleSelectedTags({ type: "stack", text: tag });
            }}
          />
        </Space.Compact>
      </div>
      {!list.length ? (
        <Empty className="solid !m-0 rounded-xl border p-4" />
      ) : (
        <ExampleList
          data={list}
          onTagSelect={handleSelectedTags}
          selectedTags={search?.tags as Tag[]}
        />
      )}
    </div>
  );
};

export const ExampleList = ({
  data,
  onTagSelect,
  selectedTags,
}: {
  data: Example[];
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {data.map((item, index) => (
        <div
          className="solid flex flex-col gap-5 rounded-xl border border-zinc-200 px-6 py-5"
          key={index}
        >
          <div>
            <a
              href={item.link}
              className="text-base font-semibold !text-emerald-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
            <p className="text-zinc-500">{item.description}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag, tagIndex) => (
              <div
                className={cx(
                  "solid w-fit cursor-pointer rounded-md border border-zinc-200 px-2 py-1 hover:bg-zinc-200",
                  selectedTags?.some((x) => x.text === tag.text) &&
                    "bg-zinc-200 hover:bg-zinc-300/95"
                )}
                key={`${index}-${tagIndex}`}
                onClick={() => onTagSelect(tag)}
              >
                {tag.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function getFuse(data: Example[]) {
  // @ts-ignore
  const options: Fuse.IFuseOptions<Example> = {
    keys: ["title", "description", "link"],
  };
  return new Fuse(data, options);
}
