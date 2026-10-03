"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ExternalLink,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { useLocale, getToolDescription } from "@/lib/locale-context";
import { findResources, resourceDatabase } from "@/lib/resource-search";
import type { Resource } from "@/lib/resource-search/types";
import ResourceSearchBox from "./ResourceSearchBox";
import KeywordChips from "./KeywordChips";
import ToolDetailPanel from "./ToolDetailPanel";
import QueryWorkbench from "./QueryWorkbench";

export default function ResourceFinder({
  directory = false,
}: {
  directory?: boolean;
}) {
  const { locale, dict } = useLocale();
  const zh = locale === "zh-TW";
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const region = params.get("region") ?? "all";
  const freeOnly = params.get("free") === "1";
  const beginnerOnly = params.get("easy") === "1";
  const directOnly = params.get("direct") === "1";
  const knownCoverageOnly = params.get("known") === "1";
  const filtersActive = freeOnly || beginnerOnly || region !== "all" || directOnly || knownCoverageOnly;
  const [limit, setLimit] = useState(directory ? 12 : 5);
  const [selected, setSelected] = useState<Resource | null>(null);
  const stateKey = params.toString();
  useEffect(() => setLimit(directory ? 12 : 5), [stateKey, directory]);
  const response = findResources(query, {
    intent: params.get("intent") ?? undefined,
    goal: params.get("goal") ?? undefined,
    region,
    freeOnly,
    beginnerOnly,
    directOnly,
    knownCoverageOnly,
  });
  const { intent, goal, results } = response;
  const roleFilter = params.get("role") ?? "all";
  const visibleResults = results.filter(r => roleFilter === "all" || r.role === roleFilter);
  const roleLabels: Record<string, string> = zh
    ? { direct: "可從這類線索開始", pivot: "需要補充線索", analysis: "整理與分析", support: "研究準備", unknown: "用途待整理" }
    : { direct: "Start with this input", pivot: "Needs another clue", analysis: "Organise and analyse", support: "Research preparation", unknown: "Needs classification" };
  const extraInputs: Record<string, string> = zh ? {preparation: "研究環境", question: "查證問題", query: "搜尋語句", file_hash: "檔案雜湊", aircraft: "航空器或航班識別碼", vessel: "船舶名稱或識別碼", radio_signal: "頻率或訊號線索"} : {preparation: "Research environment", question: "Research question", query: "Search query", file_hash: "File hash", aircraft: "Aircraft or flight identifier", vessel: "Vessel name or identifier", radio_signal: "Frequency or signal clue"};
  const kindLabels: Record<string, string> = zh ? {search: "搜尋工具", database: "資料庫", platform: "公開平台", software: "軟體", directory: "資源目錄", method: "方法資料集"} : {search: "Search tool", database: "Database", platform: "Public platform", software: "Software", directory: "Directory", method: "Method collection"};
  function inputLabels(inputs: string[]) { return inputs.map(id => resourceDatabase.intents.find(i => i.id === id)?.label[locale] ?? extraInputs[id] ?? id).join(" · "); }
  const hasSearch = !!query.trim() || !!intent;
  const showResults = directory || hasSearch;
  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    router.push(
      `${directory ? "/directory" : "/search"}${next.size ? `?${next}` : ""}`,
      { scroll: false },
    );
  }
  const regions = [
    ["all", zh ? "不限地區" : "All regions"],
    ["us", zh ? "美國" : "United States"],
    ["uk", zh ? "英國" : "United Kingdom"],
    ["cn", zh ? "中國大陸" : "Mainland China"],
    ["tw", zh ? "台灣" : "Taiwan"],
    ["hk", zh ? "香港" : "Hong Kong"],
  ];
  return (
    <main className="resource-finder mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
      <header className="mb-7">
        <p className="resource-eyebrow">
          {zh ? "OSINT 公開資源導航" : "OSINT resource navigator"}
        </p>
        <h1 className="text-3xl sm:text-4xl mb-3">
          {directory
            ? zh
              ? "工具目錄"
              : "Resource directory"
            : zh
              ? "你想查證什麼？"
              : "What would you like to research?"}
        </h1>
        <p className="resource-muted">
          {directory
            ? zh
              ? "搜尋工具名稱或瀏覽資源。費用與可用性以來源網站為準。"
              : "Search by resource name or browse the collection. Check each source for current access and pricing."
            : zh
              ? "用日常關鍵詞找到資源，再選擇查證目的。"
              : "Use everyday keywords to find resources, then choose your research goal."}
        </p>
      </header>
      <ResourceSearchBox query={query} directory={directory} />
      {!hasSearch && !directory && (
        <section className="mt-8">
          <h2 className="text-lg mb-4">
            {zh ? "選一個對象開始" : "Choose a starting point"}
          </h2>
          <KeywordChips all />
          <p className="resource-muted mt-5">
            {zh
              ? "推薦的是網站和方法。輸入的姓名或公司名稱不會傳送到推薦網站。"
              : "Results are websites and methods. Names and company names entered here are not sent to recommended websites."}
          </p>
          <Link className="resource-text-link mt-5" href="/learn">
            {zh ? "先了解 OSINT" : "Learn about OSINT first"}
            <ArrowRight size={16} />
          </Link>
        </section>
      )}
      {showResults && (
        <>
          {intent && (
            <section
              className="resource-intent mt-7"
              aria-label={zh ? "查證目的" : "Research goal"}
            >
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h2 className="text-xl">
                  {intent.label[locale]} · {zh ? "從這裡開始" : "Start here"}
                </h2>
                <Link href={["company","person","image","website","news","document","academic","video","location"].includes(intent.id) ? `/tasks?task=${intent.id}` : "/learn"} className="resource-text-link">
                  <BookOpen size={16} />
                  {zh ? "查證方法與實作" : "Methods and practice"}
                </Link>
              </div>
              <p className="resource-muted mt-2">{intent.hint[locale]}</p>
              <div className="resource-chips mt-4">
                <button
                  className="resource-chip"
                  aria-pressed={!goal}
                  onClick={() => update({ intent: intent.id, goal: "all" })}
                >
                  {zh ? "所有目的" : "All goals"}
                </button>
                {resourceDatabase.goals
                  .filter((g) => intent.goals.includes(g.id))
                  .map((g) => (
                    <button
                      key={g.id}
                      className="resource-chip"
                      aria-pressed={goal === g.id}
                      onClick={() => update({ intent: intent.id, goal: g.id })}
                    >
                      {g.label[locale]}
                    </button>
                  ))}
              </div>
              <p className="resource-lesson mt-5">{intent.lesson[locale]}</p>
            </section>
          )}
          {intent && ["person", "company", "website", "document", "news", "academic"].includes(intent.id) && <QueryWorkbench key={intent.id} intent={intent.id} />}
          {hasSearch && !intent && !directory && (
            <div className="resource-refine mt-6">
              <p>
                {zh
                  ? "想查的是哪一類？選擇對象，可以得到使用方法推薦。"
                  : "What kind of subject is this? Choose a type for guided resource recommendations."}
              </p>
              <div className="resource-chips mt-3">
                {resourceDatabase.intents.slice(0, 5).map((i) => (
                  <button
                    className="resource-chip"
                    key={i.id}
                    onClick={() => update({ intent: i.id, goal: null })}
                  >
                    {i.label[locale]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <details
            className="resource-filters mt-6"
            open={
              filtersActive ? true : undefined
            }
          >
            <summary>
              <SlidersHorizontal size={16} aria-hidden="true" />
              {zh ? "縮小範圍" : "Narrow the results"}
              {(filtersActive) && (
                <span> · {zh ? "已啟用" : "Active"}</span>
              )}
            </summary>
            <div className="flex flex-wrap items-center gap-5 mt-4">
              <label className="flex items-center gap-2">
                {zh ? "適用地區" : "Region"}
                <select
                  value={region}
                  onChange={(e) =>
                    update({
                      region: e.target.value === "all" ? null : e.target.value,
                    })
                  }
                >
                  {regions.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) =>
                    update({ free: e.target.checked ? "1" : null })
                  }
                />
                {zh ? "免費資源" : "Free resources"}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={beginnerOnly}
                  onChange={(e) =>
                    update({ easy: e.target.checked ? "1" : null })
                  }
                />
                {zh ? "新手可直接用的網站" : "Beginner-friendly websites"}
              </label>
              {intent && <label className="flex items-center gap-2"><input type="checkbox" checked={directOnly} onChange={e => update({ direct: e.target.checked ? "1" : null })}/>{zh ? "只看能直接使用這類線索的資源" : "Only resources accepting this input"}</label>}
              <label className="flex items-center gap-2"><input type="checkbox" checked={knownCoverageOnly} onChange={e => update({ known: e.target.checked ? "1" : null })}/>{zh ? "只看已標註地區的資源" : "Only resources with annotated coverage"}</label>
              {(filtersActive) && (
                <button
                  className="resource-text-link"
                  onClick={() =>
                    update({ free: null, easy: null, region: null, direct: null, known: null })
                  }
                >
                  {zh ? "清除篩選" : "Clear filters"}
                </button>
              )}
            </div>
            <p className="resource-small mt-3">
              {zh
                ? "地區篩選使用已整理的適用範圍，包含跨地區資源；未標註地區的資源會保留並提示涵蓋範圍待確認。"
                : "Region filters include global resources with documented coverage. Resources with unknown coverage remain visible and are labelled."}
            </p>
          </details>
          <div
            className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-4"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="text-lg">
              {directory
                ? zh
                  ? "收錄資源"
                  : "Indexed resources"
                : zh
                  ? "適合的資源"
                  : "Useful resources"}{" "}
              <span className="resource-muted">({results.length})</span>
            </h2>
            {hasSearch && (
              <p className="resource-small">
                {zh
                  ? "資源推薦，並非對象的調查結果"
                  : "Resource suggestions, not findings about your subject"}
              </p>
            )}
          </div>
          {results.length === 0 && (
            <section className="resource-empty">
              <h3 className="text-xl mb-3">
                {zh ? "目前沒有匹配的資源" : "No matching resources yet"}
              </h3>
              <p className="resource-muted">
                {zh
                  ? "嘗試較短的關鍵詞，或清除篩選。你也可以選擇下列對象重新開始。"
                  : "Try a shorter keyword or clear the filters. You can also start again with a subject below."}
              </p>
              <div className="mt-5">
                <KeywordChips all />
              </div>
              {(filtersActive || goal) && (
                <button
                  className="resource-secondary mt-5"
                  onClick={() =>
                    update({
                      free: null,
                      easy: null,
                      region: null,
                      goal: "all",
                      direct: null,
                      known: null,
                    })
                  }
                >
                  {zh ? "清除篩選和目的" : "Clear filters and goal"}
                </button>
              )}
            </section>
          )}
          {intent && <div className="resource-chips mb-5" aria-label={zh ? "依用途查看" : "Browse by role"}>
            <button className="resource-chip" aria-pressed={roleFilter === "all"} onClick={() => update({ role: null })}>{zh ? "全部相關資源" : "All related resources"} ({results.length})</button>
            {Object.entries(roleLabels).map(([id, label]) => {
              const count = results.filter(r => r.role === id).length;
              return count > 0 && <button className="resource-chip" key={id} aria-pressed={roleFilter === id} onClick={() => update({ role: id })}>{label} ({count})</button>;
            })}
          </div>}
          {visibleResults.length === 0 && results.length > 0 && <p className="resource-muted">{zh ? "這個用途目前沒有結果，請選擇全部相關資源。" : "No resources in this role; choose all related resources."}</p>}
          <div className="resource-results">
            {visibleResults.slice(0, limit).map(({ resource: r, match, role, coverageUnknown }) => (
              <article className="resource-result" key={r.id}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="resource-eyebrow">
                      {intent ? roleLabels[role] : match === "intent"
                        ? zh
                          ? "符合查證目的"
                          : "Matches your research goal"
                        : match === "target"
                          ? zh
                            ? "與這類對象相關"
                            : "Related to this subject type"
                          : zh
                            ? "工具資料匹配"
                            : "Resource match"}
                    </p>
                    <h3 className="text-xl">{r.name}</h3>
                  </div>
                  <div className="resource-badges">
                    {r.capability && <span>{kindLabels[r.capability.kind] ?? r.capability.kind}</span>}
                    <span>
                      {dict.labels.pricing[r.pricing ?? "unknown"] ?? r.pricing}
                    </span>
                    <span>
                      {dict.labels.difficulty[r.difficulty ?? "unknown"] ??
                        r.difficulty}
                    </span>
                    <span>{(r.capability?.regions.length ? r.capability.regions : r.guide?.regions ?? []).map(reg => regions.find(([id]) => id === reg)?.[1] ?? (zh ? "跨地區" : "Cross-region")).join(" · ") || (zh ? "地區範圍待確認" : "Coverage unknown")}</span>
                    {r.review?.status !== "manually_reviewed" && (
                      <span>{zh ? "待人工審核" : "Pending review"}</span>
                    )}
                    {r.ethical_flag && (
                      <span>
                        {zh ? "使用前查看注意事項" : "Review usage cautions"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="resource-muted mt-3">
                  {r.guide?.reason[locale] ?? getToolDescription(r, locale)}
                </p>
                {r.capability ? <dl className="resource-capabilities mt-4"><div><dt>{zh ? "所需輸入" : "Required input"}</dt><dd>{inputLabels(r.capability.accepted_inputs)}</dd></div><div><dt>{zh ? "預期結果" : "Expected output"}</dt><dd>{r.capability.output[locale]}</dd></div></dl> : <p className="resource-small mt-3">{zh ? "輸入與输出條件待整理，使用前請查看來源說明。" : "Input and output conditions need classification; consult the source documentation."}</p>}
                {region !== "all" && coverageUnknown && <p className="resource-small mt-3">{zh ? "地區涵蓋範圍待確認" : "Regional coverage needs confirmation"}</p>}
                {!r.guide && r.capability && <div className="resource-start"><strong>{zh ? "第一步" : "First step"}</strong><p>{role === "analysis"
                  ? (zh ? "先整理已有線索與出處，再按工具支援的格式匯入或查詢。關係圖中的連線仍需證據支持。" : "Organise existing clues and their sources before importing or querying supported inputs. Graph connections still need evidence.")
                  : role === "support"
                    ? (zh ? "先閱讀來源說明，依實際任務選擇需要的準備；它不是對象查詢入口。" : "Read the source instructions and choose preparation appropriate to your task; this is not a subject lookup.")
                    : (zh ? "先查看來源的涵蓋範圍與存取條件，再使用上方支援的輸入查詢，手動核對一筆結果。" : "Check source coverage and access requirements, then use a supported input above and inspect one result manually.")}</p></div>}
                {r.guide && (
                  <div className="resource-start">
                    <strong>{zh ? "第一步" : "First step"}</strong>
                    <p>{r.guide.start[locale]}</p>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  <a
                    className="resource-primary"
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {zh ? "打開網站／工具" : "Open resource"}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                  <button
                    className="resource-text-link"
                    onClick={() => setSelected(r)}
                  >
                    {zh ? "完整介紹" : "Full details"}
                  </button>
                </div>
                {(r.guide || r.capability) && (
                  <details className="resource-limitations mt-4">
                    <summary>
                      {zh
                        ? "這個來源有什麼局限？"
                        : "What are the limitations?"}
                    </summary>
                    <p className="resource-muted mt-2">
                      {r.guide?.limitations[locale] ?? (zh ? "候選資料需要回到原始來源核實。沒有匹配不能證明不存在。" : "Verify candidate records against original sources. No match does not prove absence.")}
                    </p>
                    {r.capability?.coverage_note && <p className="resource-small mt-3">{r.capability.coverage_note[locale]}</p>}
                    <p className="resource-small mt-3">{zh ? "下一步：保存網址與查閱時間，記錄支持的事實及尚未確定的部分。" : "Next: save the URL and access time, record supported facts and unresolved questions."} <Link className="resource-text-link" href="/learn#research-note">{zh ? "使用查證記錄" : "Use the research note"}</Link></p>
                    {r.guide?.source_url && <p className="resource-small mt-3"><a href={r.guide.source_url} target="_blank" rel="noopener noreferrer">{zh ? "來源說明" : "Source documentation"}</a> · {zh ? "說明核對日期" : "Documentation checked"}: {r.guide.source_checked_at}</p>}
                  </details>
                )}
                {r.ethical_flag && (
                  <p className="resource-small mt-3">
                    {r.ethics_note ??
                      (zh
                        ? "請先查看完整介紹中的使用注意事項。"
                        : "Check the usage notes in full details before proceeding.")}
                  </p>
                )}
              </article>
            ))}
          </div>
          {limit < visibleResults.length && (
            <button
              className="resource-secondary mx-auto mt-6"
              onClick={() => setLimit((n) => n + (directory ? 12 : 5))}
            >
              {zh ? "顯示更多資源" : "Show more resources"} (
              {visibleResults.length - limit})
            </button>
          )}
          {!directory && (
            <Link className="resource-text-link mt-8" href="/directory">
              {zh ? "瀏覽完整工具目錄" : "Browse the full resource directory"}
              <ArrowRight size={16} />
            </Link>
          )}
        </>
      )}
      <ToolDetailPanel tool={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
