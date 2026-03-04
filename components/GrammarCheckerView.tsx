import React, { useState } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { checkGrammar } from '../services/geminiService';
import type { GrammarAnalysis } from '../types';
import { useProgress } from '../hooks/useProgress';

/**
 * Diff Match and Patch
 * Copyright 2018 The diff-match-patch Authors.
 * https://github.com/google/diff-match-patch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class DiffMatchPatch {
  diff_main(text1: string, text2: string) {
    // Check for equality (speedup).
    if (text1 == text2) {
      if (text1) {
        return [[0, text1]];
      }
      return [];
    }
  
    // Trim off common prefix (speedup).
    var commonprefix = this.diff_commonPrefix(text1, text2);
    var commonlength = commonprefix; // Is a number
    var text1_prefix = text1.substring(0, commonlength);
    text1 = text1.substring(commonlength);
    text2 = text2.substring(commonlength);
  
    // Trim off common suffix (speedup).
    var commonsuffix = this.diff_commonSuffix(text1, text2);
    commonlength = commonsuffix; // Is a number
    var text1_suffix = text1.substring(text1.length - commonlength);
    text1 = text1.substring(0, text1.length - commonlength);
    text2 = text2.substring(0, text2.length - commonlength);
  
    // Compute the diff on the middle block.
    var diffs = this.diff_compute_(text1, text2);
  
    // Restore the prefix and suffix.
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
  
    if (!text1) {
      // Just add some text (speedup).
      return [[1, text2]];
    }
  
    if (!text2) {
      // Just delete some text (speedup).
      return [[-1, text1]];
    }
  
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    var i = longtext.indexOf(shorttext);
    if (i != -1) {
      // Shorter text is inside the longer text (speedup).
      diffs = [
        [1, longtext.substring(0, i)],
        [0, shorttext],
        [1, longtext.substring(i + shorttext.length)]
      ];
      // Swap insertions for deletions if diff is reversed.
      if (text1.length > text2.length) {
        diffs[0][0] = diffs[2][0] = -1;
      }
      return diffs;
    }
  
    if (shorttext.length == 1) {
      // Single character string.
      // After the previous speedup, the character can't be an equality.
      return [[-1, text1], [1, text2]];
    }
  
    // Check to see if the problem can be split in two.
    var hm = this.diff_halfMatch_(text1, text2);
    if (hm) {
      // A half-match was found, sort out the common prefix and suffix.
      var text1_a = hm[0];
      var text1_b = hm[1];
      var text2_a = hm[2];
      var text2_b = hm[3];
      var mid_common = hm[4];
      // Send both pairs off for separate processing.
      var diffs_a = this.diff_main(text1_a, text2_a);
      var diffs_b = this.diff_main(text1_b, text2_b);
      // Merge the results.
      return diffs_a.concat([[0, mid_common]], diffs_b);
    }
  
    return this.diff_bisect_(text1, text2);
  };
  
  // Fix: Return type changed to number to represent the length of the common prefix.
  diff_commonPrefix(text1: string, text2: string): number {
    // Quick check for common null cases.
    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
      // Fix: Return 0 for no common prefix.
      return 0;
    }
    // Binary search.
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerstart = 0;
    while (pointermin < pointermid) {
      if (
        text1.substring(pointerstart, pointermid) ==
        text2.substring(pointerstart, pointermid)
      ) {
        pointermin = pointermid;
        pointerstart = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    // Fix: Return the length of the prefix, not the string itself.
    return pointermid;
  };
  
  // Fix: Return type changed to number to represent the length of the common suffix.
  diff_commonSuffix(text1: string, text2: string): number {
    if (!text1 || !text2 || text1.slice(-1) != text2.slice(-1)) {
      // Fix: Return 0 for no common suffix.
      return 0;
    }
    // Binary search.
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerend = 0;
    while (pointermin < pointermid) {
      if (
        text1.substring(text1.length - pointermid, text1.length - pointerend) ==
        text2.substring(text2.length - pointermid, text2.length - pointerend)
      ) {
        pointermin = pointermid;
        pointerend = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    // Fix: Return the length of the suffix, not the string itself.
    return pointermid;
  };
  
  diff_halfMatch_(text1: string, text2: string) {
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
      return null; // Pointless.
    }
  
    var dmp = this; 
    function diff_halfMatchI_(longtext: string, shorttext: string, i: number) {
      var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
      var j = -1;
      var best_common = '';
      var best_longtext_a: string, best_longtext_b: string, best_shorttext_a: string, best_shorttext_b: string;
      while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
        var prefixLength = dmp.diff_commonPrefix(
          longtext.substring(i),
          shorttext.substring(j)
        );
        var suffixLength = dmp.diff_commonSuffix(
          longtext.substring(0, i),
          shorttext.substring(0, j)
        );
        if (best_common.length < suffixLength + prefixLength) {
          best_common =
            shorttext.substring(j - suffixLength, j) +
            shorttext.substring(j, j + prefixLength);
          best_longtext_a = longtext.substring(0, i - suffixLength);
          best_longtext_b = longtext.substring(i + prefixLength);
          best_shorttext_a = shorttext.substring(0, j - suffixLength);
          best_shorttext_b = shorttext.substring(j + prefixLength);
        }
      }
      if (best_common.length * 2 >= longtext.length) {
        return [best_longtext_a!, best_longtext_b!, best_shorttext_a!, best_shorttext_b!, best_common];
      } else {
        return null;
      }
    }
  
    var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
    var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
    var hm;
    if (!hm1 && !hm2) {
      return null;
    } else if (!hm2) {
      hm = hm1;
    } else if (!hm1) {
      hm = hm2;
    } else {
      hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
    }
  
    var text1_a, text1_b, text2_a, text2_b;
    if (text1.length > text2.length) {
      text1_a = hm![0];
      text1_b = hm![1];
      text2_a = hm![2];
      text2_b = hm![3];
    } else {
      text2_a = hm![0];
      text2_b = hm![1];
      text1_a = hm![2];
      text1_b = hm![3];
    }
    var mid_common = hm![4];
    return [text1_a, text1_b, text2_a, text2_b, mid_common];
  };
  
  diff_bisect_(text1: string, text2: string) {
    var text1_length = text1.length;
    var text2_length = text2.length;
    var max_d = Math.ceil((text1_length + text2_length) / 2);
    var v_offset = max_d;
    var v_length = 2 * max_d;
    // Fix: Explicitly type arrays as number[] to ensure type safety and correct inference.
    var v1: number[] = new Array(v_length);
    var v2: number[] = new Array(v_length);
    for (var x = 0; x < v_length; x++) {
      v1[x] = -1;
      v2[x] = -1;
    }
    v1[v_offset + 1] = 0;
    v2[v_offset + 1] = 0;
    var delta = text1_length - text2_length;
    var front = delta % 2 != 0;
    var k1start = 0;
    var k1end = 0;
    var k2start = 0;
    var k2end = 0;
    for (var d = 0; d < max_d; d++) {
      for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
        var k1_offset = v_offset + k1;
        // Fix: Explicitly type x1 as a number to avoid type conflicts with its other declaration.
        var x1: number;
        if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
          x1 = v1[k1_offset + 1];
        } else {
          x1 = v1[k1_offset - 1] + 1;
        }
        var y1 = x1 - k1;
        while (
          x1 < text1_length &&
          y1 < text2_length &&
          text1.charAt(x1) == text2.charAt(y1)
        ) {
          x1++;
          y1++;
        }
        v1[k1_offset] = x1;
        if (x1 > text1_length) {
          k1end += 2;
        } else if (y1 > text2_length) {
          k1start += 2;
        } else if (front) {
          var k2_offset = v_offset + delta - k1;
          if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
            var x2 = text1_length - v2[k2_offset];
            if (x1 >= x2) {
              return this.diff_bisectSplit_(text1, text2, x1, y1);
            }
          }
        }
      }
  
      for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
        var k2_offset = v_offset + k2;
        // Fix: Explicitly type x2 as a number to avoid type conflicts with its other declaration.
        var x2: number;
        if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
          x2 = v2[k2_offset + 1];
        } else {
          x2 = v2[k2_offset - 1] + 1;
        }
        var y2 = x2 - k2;
        while (
          x2 < text2_length &&
          y2 < text1_length &&
          text2.charAt(x2) == text1.charAt(y2)
        ) {
          x2++;
          y2++;
        }
        v2[k2_offset] = x2;
        if (x2 > text2_length) {
          k2end += 2;
        } else if (y2 > text1_length) {
          k2start += 2;
        } else if (!front) {
          var k1_offset = v_offset + delta - k2;
          if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
            var x1 = v1[k1_offset];
            var y1 = v_offset + x1 - k1_offset;
            x2 = text2_length - x2;
            if (x1 >= text1_length - y2) {
              return this.diff_bisectSplit_(text1, text2, x1, y1);
            }
          }
        }
      }
    }
    return [[-1, text1], [1, text2]];
  };
  
  diff_bisectSplit_(text1: string, text2: string, x: number, y: number) {
    var text1a = text1.substring(0, x);
    var text2a = text2.substring(0, y);
    var text1b = text1.substring(x);
    var text2b = text2.substring(y);
  
    var diffs = this.diff_main(text1a, text2a);
    var diffsb = this.diff_main(text1b, text2b);
  
    return diffs.concat(diffsb);
  };
  
  diff_cleanupMerge(diffs: any[]) {
    diffs.push([0, '']);
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete = '';
    var text_insert = '';
    var commonlength;
    while (pointer < diffs.length) {
      switch (diffs[pointer][0]) {
        case 1:
          count_insert++;
          text_insert += diffs[pointer][1];
          pointer++;
          break;
        case -1:
          count_delete++;
          text_delete += diffs[pointer][1];
          pointer++;
          break;
        case 0:
          if (count_delete + count_insert > 1) {
            if (count_delete !== 0 && count_insert !== 0) {
              commonlength = this.diff_commonPrefix(text_insert, text_delete);
              if (commonlength !== 0) {
                if (
                  pointer - count_delete - count_insert > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] == 0
                ) {
                  diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                } else {
                  diffs.splice(0, 0, [0, text_insert.substring(0, commonlength)]);
                  pointer++;
                }
                text_insert = text_insert.substring(commonlength);
                text_delete = text_delete.substring(commonlength);
              }
              commonlength = this.diff_commonSuffix(text_insert, text_delete);
              if (commonlength !== 0) {
                diffs[pointer][1] =
                  text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                text_insert = text_insert.substring(0, text_insert.length - commonlength);
                text_delete = text_delete.substring(0, text_delete.length - commonlength);
              }
            }
            diffs.splice(
              pointer - count_delete - count_insert,
              count_delete + count_insert
            );
            pointer = pointer - count_delete - count_insert;
            if (text_delete.length) {
              diffs.splice(pointer, 0, [-1, text_delete]);
              pointer++;
            }
            if (text_insert.length) {
              diffs.splice(pointer, 0, [1, text_insert]);
              pointer++;
            }
            pointer++;
          } else if (pointer > 0 && diffs[pointer - 1][0] == 0) {
            diffs[pointer - 1][1] += diffs[pointer][1];
            diffs.splice(pointer, 1);
          } else {
            pointer++;
          }
          count_insert = 0;
          count_delete = 0;
          text_delete = '';
          text_insert = '';
          break;
      }
    }
    if (diffs[diffs.length - 1][1] === '') {
      diffs.pop();
    }
  
    var changes = false;
    pointer = 1;
    while (pointer < diffs.length - 1) {
      if (diffs[pointer - 1][0] == 0 && diffs[pointer + 1][0] == 0) {
        if (
          diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) ==
          diffs[pointer - 1][1]
        ) {
          diffs[pointer][1] =
            diffs[pointer - 1][1] +
            diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
          diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
          diffs.splice(pointer - 1, 1);
          changes = true;
        } else if (
          diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
          diffs[pointer + 1][1]
        ) {
          diffs[pointer - 1][1] += diffs[pointer + 1][1];
          diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
          diffs.splice(pointer + 1, 1);
          changes = true;
        }
      }
      pointer++;
    }
    if (changes) {
      this.diff_cleanupMerge(diffs);
    }
  }

  diff_cleanupSemantic(diffs: any[]) {
    let changes = false;
    const equalities = new Map<string, number>();
    let lastEquality = null;
    let pointer = 0;
    let length_insertions1 = 0;
    let length_deletions1 = 0;
    let length_insertions2 = 0;
    let length_deletions2 = 0;
    while (pointer < diffs.length) {
        if (diffs[pointer][0] == 0) {  // Equality.
            const equality = diffs[pointer][1];
            const count = equalities.get(equality) || 0;
            equalities.set(equality, count + 1);

            if (length_insertions1 && length_deletions1 && length_insertions2 && length_deletions2) {
                // ... complex logic for semantic cleanup
            }
            length_insertions1 = length_deletions1 = length_insertions2 = length_deletions2 = 0;
            lastEquality = equality;
        } else {  // An insertion or deletion.
            if (diffs[pointer][0] == 1) {
                length_insertions2 += diffs[pointer][1].length;
            } else {
                length_deletions2 += diffs[pointer][1].length;
            }
        }
        pointer++;
    }
    // Final cleanup logic
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
  }
}


const getErrorTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('tense')) return 'bg-[rgba(var(--sky),0.2)] text-[rgb(var(--sky))]';
    if (lowerType.includes('punctuation')) return 'bg-[rgba(var(--yellow),0.2)] text-[rgb(var(--yellow))]';
    if (lowerType.includes('spelling')) return 'bg-[rgba(var(--rose),0.2)] text-[rgb(var(--rose))]';
    if (lowerType.includes('article')) return 'bg-[rgba(var(--green),0.2)] text-[rgb(var(--green))]';
    if (lowerType.includes('preposition')) return 'bg-[rgba(var(--indigo),0.2)] text-[rgb(var(--indigo))]';
    return 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]';
};

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>
);

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 0v-3.5m0 3.5a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);


const CorrectedTextView: React.FC<{ original: string; corrected: string }> = ({ original, corrected }) => {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(original, corrected);
    dmp.diff_cleanupSemantic(diffs);

    return (
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {diffs.map(([op, text], index) => {
                switch (op) {
                    case 1: // Insert
                        return <span key={index} className="bg-[rgba(var(--green),0.1)] text-[rgb(var(--green))] font-semibold rounded px-1">{text}</span>;
                    case -1: // Delete
                        return <span key={index} className="bg-[rgba(var(--rose),0.1)] text-[rgb(var(--rose))] line-through rounded px-1">{text}</span>;
                    case 0: // Equal
                    default:
                        return <span key={index}>{text}</span>;
                }
            })}
        </p>
    );
};

export const GrammarCheckerView: React.FC = () => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const { logGrammarCheck } = useProgress();

    const handleCheck = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await checkGrammar(text);
            setAnalysis(result);
            logGrammarCheck();
        } catch (err) {
            console.error("Error checking grammar:", err);
            setError("Gramer kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (analysis) {
            navigator.clipboard.writeText(analysis.correctedText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="text-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            Kontrol edilecek metin
                        </label>
                        <textarea
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="İngilizce metninizi buraya yapıştırın..."
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-48 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={handleCheck}
                        disabled={isLoading || !text.trim()}
                    >
                        {isLoading ? 'Kontrol Ediliyor...' : 'Metni Kontrol Et'}
                    </Button>
                </div>
            </Card>

            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {analysis && (
                <Card>
                    <h3 className="text-2xl font-bold mb-6 text-center">Analiz Sonuçları</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xl font-semibold text-[rgb(var(--foreground))]">Düzeltilmiş Metin</h4>
                                <Button onClick={handleCopy} variant="secondary" className="text-sm !py-1.5">
                                    {isCopied ? 'Kopyalandı!' : (
                                        <>
                                            <CopyIcon className="w-4 h-4" />
                                            <span>Kopyala</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="p-4 bg-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-lg">
                                <CorrectedTextView original={text} corrected={analysis.correctedText} />
                            </div>
                        </div>

                        {analysis.errors.length > 0 && (
                            <div>
                                <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3">Bulunan Hatalar</h4>
                                <div className="space-y-4">
                                    {analysis.errors.map((err, index) => (
                                        <div key={index} className="p-4 border border-[rgb(var(--border))] rounded-lg shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getErrorTypeColor(err.errorType)}`}>
                                                    {err.errorType}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-md mb-2">
                                                <span className="text-red-600 line-through">{err.errorText}</span>
                                                <ArrowRightIcon className="w-5 h-5 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                                                <span className="text-green-700 font-semibold">{err.correction}</span>
                                            </div>
                                            <p className="text-[rgb(var(--muted-foreground))]">{err.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.errors.length === 0 && (
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="font-semibold text-green-800 dark:text-green-200">Harika! Metninizde herhangi bir hata bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};