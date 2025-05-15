import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const VolumeChart = ({ data, selectedContract }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    drawChart();
  }, [data, selectedContract]);

  const drawChart = () => {
    const container = d3.select(chartRef.current);
    container.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // データをフィルタリング（値が0でないデータポイントのみ）
    const filteredData = data.filter(d => d.volume !== 0);
    
    // X軸のスケール（時間）
    const x = d3.scaleBand()
      .domain(data.map(d => d.timestamp))
      .range([0, width])
      .padding(0.1);

    // Y軸のスケール（出来高）
    const maxVolume = d3.max(data, d => Math.abs(d.volume)) || 200;
    const y = d3.scaleLinear()
      .domain([-maxVolume, maxVolume])
      .range([height, 0])
      .nice();
      
    // コンソールにデータを出力（デバッグ用）
    console.log("Chart data:", data);

    // X軸の描画
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height / 2})`)
      .call(d3.axisBottom(x)
        .tickFormat(d => {
          const date = new Date(d);
          return `${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        })
        .tickValues(data.filter((_, i) => i % 3 === 0).map(d => d.timestamp)) // 3つごとにティックを表示
      );

    // Y軸の描画
    svg.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y));

    // Y軸のラベル
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('出来高（約定数）');

    // 中央の水平線（ゼロライン）
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', height / 2)
      .attr('x2', width)
      .attr('y2', height / 2)
      .attr('stroke', '#555')
      .attr('stroke-width', 1);

    // バーの描画
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', d => `bar ${d.volume >= 0 ? 'positive' : 'negative'}`)
      .attr('x', d => x(d.timestamp))
      .attr('y', d => d.volume >= 0 ? y(d.volume) : y(0))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d.volume) - y(0)))
      .attr('rx', 2)
      .attr('ry', 2);

    // 選択された契約のタイトル
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title')
      .style('font-size', '14px')
      .style('fill', '#f0f0f0')
      .text(`${selectedContract} - 出来高チャート`);
  };

  return (
    <div className="chart-container" ref={chartRef}></div>
  );
};

export default VolumeChart;
