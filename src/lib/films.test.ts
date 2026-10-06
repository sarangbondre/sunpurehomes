import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getProjectSlugs } from "@/lib/content";
import { embedSrc, getFilms, groupFilms, watchHref } from "@/lib/films";

/**
 * The films are a hand-written list of someone else's video ids, so the two
 * things that will go wrong are a slug that no longer names a development and
 * an id that is written twice. Neither shows up as an error — the first drops
 * a whole development's films off the page silently, and the second embeds the
 * same film twice.
 */
describe("films", () => {
  const films = getFilms();

  it("names a development that exists, or none at all", () => {
    const slugs = new Set(getProjectSlugs());
    for (const film of films) {
      if (film.project === undefined) continue;
      assert.ok(slugs.has(film.project), `${film.id} names "${film.project}"`);
    }
  });

  it("has no film twice", () => {
    const ids = films.map((film) => film.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("gives every film a title and a plausible id", () => {
    for (const film of films) {
      assert.ok(film.title.trim().length > 0, `${film.id} has no title`);
      assert.match(film.id, /^[A-Za-z0-9_-]{11}$/, `${film.id} is not a video id`);
    }
  });

  it("embeds without a tracking cookie and links to the watch page", () => {
    const film = films[0];
    assert.equal(embedSrc(film), `https://www.youtube-nocookie.com/embed/${film.id}`);
    assert.equal(watchHref(film), `https://www.youtube.com/watch?v=${film.id}`);
  });

  it("groups in the order it is given and keeps every film", () => {
    const order = ["curve", "h4", "v4", "blessed", "happiness-1", "happiness-2", "fadal", "meraki"];
    const groups = groupFilms(films, order);

    const grouped = groups.flatMap((group) => group.films);
    assert.equal(grouped.length, films.length, "a film was dropped");

    const named = groups.filter((group) => group.project).map((group) => group.project);
    assert.deepEqual(named, order.filter((slug) => films.some((f) => f.project === slug)));
  });

  it("leaves out a development with no film rather than showing it empty", () => {
    const groups = groupFilms(films, ["curve", "rare-earth"]);
    assert.deepEqual(
      groups.map((group) => group.project),
      ["curve", undefined],
    );
  });

  it("puts the company's own films last", () => {
    const groups = groupFilms(films, getProjectSlugs());
    assert.equal(groups.at(-1)?.project, undefined);
  });

  it("drops the house group when every film belongs to a development", () => {
    const only = films.filter((film) => film.project !== undefined);
    const groups = groupFilms(only, getProjectSlugs());
    assert.ok(groups.every((group) => group.project !== undefined));
  });
});
