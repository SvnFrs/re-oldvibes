"use client";

import React, { useEffect, useState } from "react";
import { getPublicSupport, type SupportQuestion } from "../api/support";
import { IconChevronDown, IconChevronUp, IconSearch } from "@tabler/icons-react";

export default function SupportPage() {
  const [items, setItems] = useState<SupportQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPublicSupport(search ? { q: search } : undefined);
      setItems(res.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-gruvbox-orange">Support</h1>
        <p className="text-gruvbox-dark-fg2 mb-6">Frequently asked questions and helpful answers.</p>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray" />
            <input
              className="w-full border border-gruvbox-dark-bg2 bg-gruvbox-dark-bg1 text-gruvbox-dark-fg0 rounded pl-9 pr-3 py-2 focus:ring-2 focus:ring-gruvbox-orange"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

        {loading ? (
          <div className="text-gruvbox-dark-fg1">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gruvbox-gray">No results.</div>
        ) : (
          <div className="space-y-3">
          {items.map((it) => {
            const open = openId === it._id;
            return (
              <div key={it._id} className="border border-gruvbox-dark-bg2 bg-gruvbox-dark-bg1 rounded">
                <button
                  className="w-full flex items-center justify-between p-3 text-left text-gruvbox-dark-fg0 hover:bg-gruvbox-dark-bg2 transition"
                  onClick={() => setOpenId(open ? null : it._id)}
                >
                  <span className="font-semibold">{it.question}</span>
                  {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </button>
                {open && (
                  <div className="px-3 pb-3 text-sm whitespace-pre-wrap text-gruvbox-dark-fg2">{it.answer}</div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
