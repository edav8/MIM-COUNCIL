import React, { useState } from 'react';
import { EvidenceChart, DataComponent, ReportSection, RichNarrative, useDataApp } from '../../data-app-public.jsx';
import { copy } from './narrative.js';

const pct=n=>`${n.toFixed(1)}%`;
function Readout({id,title,queries}){
 const {snapshot,visible}=useDataApp();
 if(!visible(id))return null;
 const area={'careers-reading':'Careers','academics-reading':'Academics','life-reading':'Student life / well-being'}[id];
 const scope=Object.fromEntries(queries.map(q=>[q,area?snapshot.queries[q].rows.filter(r=>r.Area===area):snapshot.queries[q].rows]));
 return <ReportSection id={id} title={title} queryId={queries[0]} queryIds={queries} sourceRowsByQuery={scope} showHeading={false}>
  <RichNarrative id={`${id}:body`} value={copy[id]} label={`Edit ${title}`}/>
 </ReportSection>;
}
function Table({id,title,queryId,rows,columns}){
 const {visible}=useDataApp();if(!visible(id))return null;
 return <DataComponent id={id} title={title} queryId={queryId} kind="table" sourceRows={rows} displayRows={rows}>
  <div className="survey-table-scroll"><table className="survey-table" data-reviewed-rows><caption className="survey-sr-only">{title}</caption>
   <thead><tr>{columns.map(c=><th key={c.key} scope="col">{c.label||c.key}</th>)}</tr></thead>
   <tbody>{rows.map((r,i)=><tr key={i}>{columns.map(c=><td className={c.numeric?'numeric':''} key={c.key}>{c.format?c.format(r[c.key]):r[c.key]}</td>)}</tr>)}</tbody>
  </table></div>
 </DataComponent>;
}
const bar={type:'horizontalBar',x:'Label',y:'Respondents (%)',startAtZero:true,showValues:true,valueDecimals:1,stackable:false,colors:['#376892']};
export function ReportContent(){
 const {snapshot,appTitle,canEdit,mode,setAppTitle}=useDataApp();
 const [selectedArea,setSelectedArea]=useState('All areas');
 const q=id=>snapshot.queries[id].rows;
 const areaRows=area=>q('priorities').filter(r=>r.Area===area);
 const tableRows=selectedArea==='All areas'?q('priorities'):areaRows(selectedArea);
 return <article className="report-content survey-report" aria-label="Student Life survey analysis">
  <header className="report-hero">
   <h1 data-data-app-title contentEditable={canEdit&&mode==='edit'} suppressContentEditableWarning onBlur={canEdit&&mode==='edit'?e=>setAppTitle(e.currentTarget.textContent.trim()||appTitle):undefined}>{appTitle}</h1>
   <RichNarrative id="survey:deck" className="report-deck" value="Student Council · Findings, proposed actions and data-quality review · 8 October 2026"/>
  </header>
  <Readout id="executive-summary" title="Executive summary" queries={['overview','priorities','quality']}/>
  <EvidenceChart id="overview-chart" queryId="overview" title="Importance and satisfaction across the three areas" rows={q('overview')} sourceRows={q('overview')} description="Share of 145 retained complete responses. The measures come from separate questions."
   spec={{type:'bar',x:'Area',y:'Respondents (%)',series:'Measure',startAtZero:true,showValues:true,valueDecimals:1,stackable:false,colors:['#376892','#B98424']}} height={340}/>
  <Readout id="satisfaction-reading" title="Neutral responses matter" queries={['satisfaction']}/>
  <EvidenceChart id="satisfaction-chart" queryId="satisfaction" title="How satisfaction is distributed" rows={q('satisfaction')} sourceRows={q('satisfaction')} description="Share of 145 respondents; the three bands are mutually exclusive."
   spec={{type:'horizontalStackedBar',x:'Area',y:'Respondents (%)',series:'Response',startAtZero:true,showValues:true,valueDecimals:1,colors:['#376892','#B8B8B0','#B98424']}} height={300}/>
  {[['Careers','careers',570],['Academics','academics',500],['Student life / well-being','life',500]].map(([area,id,height])=><section className="report-section" key={id}>
   <Readout id={`${id}-reading`} title={area} queries={['priorities','themes']}/>
   <EvidenceChart id={`${id}-chart`} queryId="priorities" title={`${area} improvements selected`} rows={areaRows(area)} sourceRows={areaRows(area)} spec={bar} height={height} description="All 145 respondents; options overlap. Full wording is retained in the evidence table."/>
  </section>)}
  <Readout id="actions" title="Recommended actions" queries={['overview','priorities','themes','quality']}/>
  <Readout id="quality-review" title="Data-quality review" queries={['quality','checks']}/>
  <Table id="quality-table" title="Issues, implications and handling" queryId="quality" rows={q('quality')} columns={[{key:'Check'},{key:'Evidence'},{key:'Severity'},{key:'Impact / handling'}]}/>
  <Readout id="cap-reading" title="Selection-limit sensitivity" queries={['priorities']}/>
  <Readout id="sensitivity-reading" title="Population sensitivity" queries={['sensitivity']}/>
  <Table id="sensitivity-table" title="Positive satisfaction under alternative inclusion rules" queryId="sensitivity" rows={q('sensitivity')} columns={[{key:'Population'},{key:'Area'},{key:'Base',numeric:true},{key:'Satisfied (%)',numeric:true,format:pct}]}/>
  <section className="report-section">
   <RichNarrative id="survey:detail-intro" value="## Inspect the exact improvement counts\n\nCompare the main population with the responses that stayed within the three-choice limit. Full option wording is retained below."/>
   <label className="survey-filter">Area <select aria-label="Improvement table area" value={selectedArea} onChange={e=>setSelectedArea(e.target.value)}><option>All areas</option>{['Academics','Careers','Student life / well-being'].map(a=><option key={a}>{a}</option>)}</select></label>
   <Table id="priorities-table" title={`Improvement selections · ${selectedArea}`} queryId="priorities" rows={tableRows} columns={[{key:'Area'},{key:'Option'},{key:'Count',numeric:true},{key:'Respondents (%)',label:'% of 145',numeric:true,format:pct},{key:'Within cap count',label:'Within cap n',numeric:true},{key:'Within cap base',label:'Within cap base',numeric:true},{key:'Within cap (%)',numeric:true,format:pct}]}/>
  </section>
  <Readout id="methods" title="Scope and methods" queries={['checks','daily','themes']}/>
  <Table id="checks-table" title="Validation counts" queryId="checks" rows={q('checks')} columns={[{key:'Check'},{key:'Value',numeric:true}]}/>
 </article>;
}
