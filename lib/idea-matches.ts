export type MatchableIdea = {id:string;title:string};
export function normalizeIdeaTitle(title:string) {
 return title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/\b(soccer|soccar)\b/g,'football').replace(/\bmovies\b/g,'movie')
  .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
export function matchingIdeas<T extends MatchableIdea>(title:string,ideas:T[]):T[] {
 const normalized=normalizeIdeaTitle(title);if(normalized.length<3)return [];
 const stop=new Set(['a','an','the','for','to','of','and','with','our','idea']);
 const tokens=(text:string)=>new Set(normalizeIdeaTitle(text).split(' ').filter(x=>x.length>2&&!stop.has(x)));
 const query=tokens(title);
 return ideas.map((idea,index)=>{
  const candidate=normalizeIdeaTitle(idea.title),words=tokens(idea.title);
  const common=[...query].filter(x=>words.has(x)).length;
  const score=normalized===candidate?10:candidate.includes(normalized)?3:common/Math.max(query.size,words.size,1);
  return {idea,index,score};
 }).filter(x=>x.score>=0.5).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3).map(x=>x.idea);
}
