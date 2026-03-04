import React, { useState } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { analyzeStyleAndTone } from '../services/geminiService';
import type { ToneAnalysisResult } from '../types';

// This DiffMatchPatch class is a direct copy from GrammarCheckerView to provide diffing functionality.
// In a larger application, this would ideally be moved to a shared utility file.
class DiffMatchPatch {
  diff_main(text1: string, text2: string) {
    if (text1 == text2) {
      if (text1) {
        return [[0, text1]];
      }
      return [];
    }
    var commonprefix = this.diff_commonPrefix(text1, text2);
    var text1_prefix = text1.substring(0, commonprefix);
    text1 = text1.substring(commonprefix);
    text2 = text2.substring(commonprefix);
    var commonsuffix = this.diff_commonSuffix(text1, text2);
    var text1_suffix = text1.substring(text1.length - commonsuffix);
    text1 = text1.substring(0, text1.length - commonsuffix);
    text2 = text2.substring(0, text2.length - commonsuffix);
    var diffs = this.diff_compute_(text1, text2);
    if (text1_prefix) {
      diffs.unshift([0, text1_prefix]);
    }
    if (text1_suffix) {
      diffs.push([0, text1_suffix]);
    }
    this.diff_cleanupMerge(diffs);
    return diffs;
  };
  
  diff_compute_(text1: string, text2: string) {
    var diffs;
    if (!text1) return [[1, text2]];
    if (!text2) return [[-1, text1]];
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    var i = longtext.indexOf(shorttext);
    if (i != -1) {
      diffs = [[1, longtext.substring(0, i)], [0, shorttext], [1, longtext.substring(i + shorttext.length)]];
      if (text1.length > text2.length) {
        diffs[0][0] = diffs[2][0] = -1;
      }
      return diffs;
    }
    if (shorttext.length == 1) return [[-1, text1], [1, text2]];
    var hm = this.diff_halfMatch_(text1, text2);
    if (hm) {
      var text1_a = hm[0]; var text1_b = hm[1]; var text2_a = hm[2]; var text2_b = hm[3]; var mid_common = hm[4];
      var diffs_a = this.diff_main(text1_a, text2_a);
      var diffs_b = this.diff_main(text1_b, text2_b);
      return diffs_a.concat([[0, mid_common]], diffs_b);
    }
    return this.diff_bisect_(text1, text2);
  };
  
  diff_commonPrefix(text1: string, text2: string): number {
    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) return 0;
    var pointermin = 0; var pointermax = Math.min(text1.length, text2.length); var pointermid = pointermax; var pointerstart = 0;
    while (pointermin < pointermid) {
      if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
        pointermin = pointermid; pointerstart = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
  };
  
  diff_commonSuffix(text1: string, text2: string): number {
    if (!text1 || !text2 || text1.slice(-1) != text2.slice(-1)) return 0;
    var pointermin = 0; var pointermax = Math.min(text1.length, text2.length); var pointermid = pointermax; var pointerend = 0;
    while (pointermin < pointermid) {
      if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
        pointermin = pointermid; pointerend = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
  };
  
  diff_halfMatch_(text1: string, text2: string) {
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) return null;
    var dmp = this; 
    function diff_halfMatchI_(longtext: string, shorttext: string, i: number) {
      var seed = longtext.substring(i, i + Math.floor(longtext.length / 4)); var j = -1; var best_common = ''; var best_longtext_a: string, best_longtext_b: string, best_shorttext_a: string, best_shorttext_b: string;
      while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
        var prefixLength = dmp.diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
        var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
        if (best_common.length < suffixLength + prefixLength) {
          best_common = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
          best_longtext_a = longtext.substring(0, i - suffixLength); best_longtext_b = longtext.substring(i + prefixLength);
          best_shorttext_a = shorttext.substring(0, j - suffixLength); best_shorttext_b = shorttext.substring(j + prefixLength);
        }
      }
      if (best_common.length * 2 >= longtext.length) return [best_longtext_a!, best_longtext_b!, best_shorttext_a!, best_shorttext_b!, best_common];
      else return null;
    }
    var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
    var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
    var hm = !hm1 && !hm2 ? null : !hm2 ? hm1 : !hm1 ? hm2 : hm1[4].length > hm2[4].length ? hm1 : hm2;
    if (!hm) return null;
    var text1_a, text1_b, text2_a, text2_b;
    if (text1.length > text2.length) { text1_a = hm[0]; text1_b = hm[1]; text2_a = hm[2]; text2_b = hm[3]; } 
    else { text2_a = hm[0]; text2_b = hm[1]; text1_a = hm[2]; text1_b = hm[3]; }
    return [text1_a, text1_b, text2_a, text2_b, hm[4]];
  };
  
  diff_bisect_(text1: string, text2: string) {
    var text1_length = text1.length; var text2_length = text2.length; var max_d = Math.ceil((text1_length + text2_length) / 2); var v_offset = max_d; var v_length = 2 * max_d;
    var v1: number[] = new Array(v_length); var v2: number[] = new Array(v_length);
    for (var x = 0; x < v_length; x++) { v1[x] = -1; v2[x] = -1; }
    v1[v_offset + 1] = 0; v2[v_offset + 1] = 0;
    var delta = text1_length - text2_length; var front = delta % 2 != 0; var k1start = 0; var k1end = 0; var k2start = 0; var k2end = 0;
    for (var d = 0; d < max_d; d++) {
      for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
        var k1_offset = v_offset + k1; var x1: number;
        if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) x1 = v1[k1_offset + 1]; else x1 = v1[k1_offset - 1] + 1;
        var y1 = x1 - k1;
        while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text2.charAt(y1)) { x1++; y1++; }
        v1[k1_offset] = x1;
        if (x1 > text1_length) k1end += 2; else if (y1 > text2_length) k1start += 2;
        else if (front) {
          var k2_offset = v_offset + delta - k1;
          if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
            var x2 = text1_length - v2[k2_offset];
            if (x1 >= x2) return this.diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
      for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
        var k2_offset = v_offset + k2; var x2: number;
        if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) x2 = v2[k2_offset + 1]; else x2 = v2[k2_offset - 1] + 1;
        var y2 = x2 - k2;
        while (x2 < text2_length && y2 < text1_length && text2.charAt(x2) == text1.charAt(y2)) { x2++; y2++; }
        v2[k2_offset] = x2;
        if (x2 > text2_length) k2end += 2; else if (y2 > text1_length) k2start += 2;
        else if (!front) {
          var k1_offset = v_offset + delta - k2;
          if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
            var x1 = v1[k1_offset]; var y1 = v_offset + x1 - k1_offset; x2 = text2_length - x2;
            if (x1 >= text1_length - y2) return this.diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }
    return [[-1, text1], [1, text2]];
  };
  
  diff_bisectSplit_(text1: string, text2: string, x: number, y: number) {
    var text1a = text1.substring(0, x); var text2a = text2.substring(0, y);
    var text1b = text1.substring(x); var text2b = text2.substring(y);
    var diffs = this.diff_main(text1a, text2a); var diffsb = this.diff_main(text1b, text2b);
    return diffs.concat(diffsb);
  };
  
  diff_cleanupMerge(diffs: any[]) {
    diffs.push([0, '']); var pointer = 0; var count_delete = 0; var count_insert = 0; var text_delete = ''; var text_insert = ''; var commonlength;
    while (pointer < diffs.length) {
      switch (diffs[pointer][0]) {
        case 1: count_insert++; text_insert += diffs[pointer][1]; pointer++; break;
        case -1: count_delete++; text_delete += diffs[pointer][1]; pointer++; break;
        case 0:
          if (count_delete + count_insert > 1) {
            if (count_delete !== 0 && count_insert !== 0) {
              commonlength = this.diff_commonPrefix(text_insert, text_delete);
              if (commonlength !== 0) {
                if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] == 0) {
                  diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                } else {
                  diffs.splice(0, 0, [0, text_insert.substring(0, commonlength)]); pointer++;
                }
                text_insert = text_insert.substring(commonlength); text_delete = text_delete.substring(commonlength);
              }
              commonlength = this.diff_commonSuffix(text_insert, text_delete);
              if (commonlength !== 0) {
                diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                text_insert = text_insert.substring(0, text_insert.length - commonlength); text_delete = text_delete.substring(0, text_delete.length - commonlength);
              }
            }
            diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
            pointer = pointer - count_delete - count_insert;
            if (text_delete.length) { diffs.splice(pointer, 0, [-1, text_delete]); pointer++; }
            if (text_insert.length) { diffs.splice(pointer, 0, [1, text_insert]); pointer++; }
            pointer++;
          } else if (pointer > 0 && diffs[pointer - 1][0] == 0) {
            diffs[pointer - 1][1] += diffs[pointer][1]; diffs.splice(pointer, 1);
          } else {
            pointer++;
          }
          count_insert = 0; count_delete = 0; text_delete = ''; text_insert = '';
          break;
      }
    }
    if (diffs[diffs.length - 1][1] === '') diffs.pop();
    var changes = false; pointer = 1;
    while (pointer < diffs.length - 1) {
      if (diffs[pointer - 1][0] == 0 && diffs[pointer + 1][0] == 0) {
        if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
          diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
          diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
          diffs.splice(pointer - 1, 1); changes = true;
        } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
          diffs[pointer - 1][1] += diffs[pointer + 1][1];
          diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
          diffs.splice(pointer + 1, 1); changes = true;
        }
      }
      pointer++;
    }
    if (changes) this.diff_cleanupMerge(diffs);
  }

  diff_cleanupSemantic(diffs: any[]) {
    let changes = false; const equalities = new Map<string, number>(); let lastEquality = null; let pointer = 0; let length_insertions1 = 0; let length_deletions1 = 0; let length_insertions2 = 0; let length_deletions2 = 0;
    while (pointer < diffs.length) {
      if (diffs[pointer][0] == 0) { const equality = diffs[pointer][1]; const count = equalities.get(equality) || 0; equalities.set(equality, count + 1); if (length_insertions1 && length_deletions1 && length_insertions2 && length_deletions2) {} length_insertions1 = length_deletions1 = length_insertions2 = length_deletions2 = 0; lastEquality = equality;
      } else { if (diffs[pointer][0] == 1) length_insertions2 += diffs[pointer][1].length; else length_deletions2 += diffs[pointer][1].length; }
      pointer++;
    }
    if (changes) this.diff_cleanupMerge(diffs);
  }
}

const DiffView: React.FC<{ original: string; revised: string }> = ({ original, revised }) => {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(original, revised);
    dmp.diff_cleanupSemantic(diffs);

    return (
        <p className="text-lg leading-relaxed whitespace-pre-wrap p-4 bg-[rgb(var(--muted))] rounded-lg border border-[rgb(var(--border))]">
            {diffs.map(([op, text], index) => {
                switch (op) {
                    case 1: // Insert
                        return <span key={index} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded px-1">{text}</span>;
                    case -1: // Delete
                        return <span key={index} className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through rounded px-1">{text}</span>;
                    case 0: // Equal
                    default:
                        return <span key={index}>{text}</span>;
                }
            })}
        </p>
    );
};

export const StyleToneAnalyzerView: React.FC = () => {
    const [text, setText] = useState('');
    const [audience, setAudience] = useState('');
    const [goal, setGoal] = useState('');
    const [result, setResult] = useState<ToneAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim() || !audience.trim() || !goal.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const analysisResult = await analyzeStyleAndTone(text, audience, goal);
            setResult(analysisResult);
        } catch (err) {
            console.error("Error analyzing style and tone:", err);
            setError("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="text-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            Analiz edilecek metin (İngilizce)
                        </label>
                        <textarea
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g., Hi Bob, I need the report you were working on. Can you send it over ASAP?"
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-32 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="audience-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                                Hedef Kitle
                            </label>
                            <input
                                id="audience-input"
                                type="text"
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                placeholder="e.g., My boss"
                                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                             <label htmlFor="goal-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                                İletişim Amacı
                            </label>
                            <input
                                id="goal-input"
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g., To politely ask for a report"
                                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading || !text.trim() || !audience.trim() || !goal.trim()}
                    >
                        {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                    </Button>
                </div>
            </Card>
            
            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {result && (
                <Card>
                    <h3 className="text-2xl font-bold mb-6 text-center">Analiz Sonuçları</h3>
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3">Tespit Edilen Tonlar</h4>
                             <div className="flex flex-wrap gap-2">
                                {result.detectedTones.map((tone, index) => (
                                    <span key={index} className="px-3 py-1 text-sm font-semibold rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200">
                                        {tone}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3">Genel Analiz</h4>
                            <p className="p-4 bg-[rgb(var(--muted))] rounded-lg border border-[rgb(var(--border))] whitespace-pre-wrap">{result.overallAnalysis}</p>
                        </div>
                        
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3">Önerilen Revizyon</h4>
                            <DiffView original={text} revised={result.revisedText} />
                        </div>
                        
                        {result.suggestions.length > 0 && (
                            <div>
                                <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3">Detaylı Öneriler</h4>
                                <div className="space-y-4">
                                    {result.suggestions.map((s, index) => (
                                        <div key={index} className="p-4 border border-[rgb(var(--border))] rounded-lg">
                                            <p className="text-sm text-[rgb(var(--muted-foreground))]">
                                                <span className="line-through">{s.original}</span> 
                                                <span className="font-bold text-green-600 dark:text-green-400"> → {s.suggested}</span>
                                            </p>
                                            <p className="mt-2 text-sm">{s.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </Card>
            )}
        </div>
    );
};
