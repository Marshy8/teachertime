import type { Wedge } from "../data/schedule";

// Face geometry, in viewBox units (the face is a 100x100 box).
const CX = 50;
const CY = 50;
const R_OUTER = 47;
const R_TICK_INNER_MINUTE = 45;
const R_TICK_INNER_HOUR = 43;
const R_NUMBER = 39;
const R_DISC = 33;
const R_HAND_MINUTE = 30;
const R_HAND_HOUR = 20;

const HOUR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_TICKS = Array.from({ length: 60 }, (_, i) => i);

/** Point on the face at `radius` and `angle` degrees clockwise from 12 o'clock. */
function polar(radius: number, angle: number): [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(radians), CY + radius * Math.sin(radians)];
}

function wedgePath(startAngle: number, endAngle: number): string {
  const [x1, y1] = polar(R_DISC, startAngle);
  const [x2, y2] = polar(R_DISC, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R_DISC} ${R_DISC} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

type ClockFaceProps = {
  wedges: Wedge[];
  /** Epoch ms used to place the hands. Hands are omitted when undefined. */
  now?: number;
};

export function ClockFace({ wedges, now }: ClockFaceProps) {
  const date = now === undefined ? null : new Date(now);
  const minuteAngle = date
    ? (date.getMinutes() + date.getSeconds() / 60) * 6
    : 0;
  const hourAngle = date
    ? ((date.getHours() % 12) + date.getMinutes() / 60) * 30
    : 0;

  const [minuteX, minuteY] = polar(R_HAND_MINUTE, minuteAngle);
  const [hourX, hourY] = polar(R_HAND_HOUR, hourAngle);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle
        cx={CX}
        cy={CY}
        r={R_OUTER}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.7}
      />

      {/* Colored schedule wedges, drawn as a Time Timer style disc. */}
      {wedges.map((wedge) => {
        const span = wedge.endAngle - wedge.startAngle;
        return span >= 359.99 ? (
          <circle key={wedge.key} cx={CX} cy={CY} r={R_DISC} fill={wedge.color} />
        ) : (
          <path
            key={wedge.key}
            d={wedgePath(wedge.startAngle, wedge.endAngle)}
            fill={wedge.color}
          />
        );
      })}

      <circle
        cx={CX}
        cy={CY}
        r={R_DISC}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.4}
        opacity={0.5}
      />

      {MINUTE_TICKS.map((tick) => {
        const isHour = tick % 5 === 0;
        const [x1, y1] = polar(
          isHour ? R_TICK_INNER_HOUR : R_TICK_INNER_MINUTE,
          tick * 6,
        );
        const [x2, y2] = polar(R_OUTER, tick * 6);
        return (
          <line
            key={tick}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={isHour ? 0.9 : 0.35}
          />
        );
      })}

      {HOUR_NUMBERS.map((hour) => {
        const [x, y] = polar(R_NUMBER, hour * 30);
        return (
          <text
            key={hour}
            x={x}
            y={y}
            fill="currentColor"
            fontSize={7}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {hour}
          </text>
        );
      })}

      {/* Each hand sits on a background-coloured halo so it stays readable
          whatever colour the wedge underneath it happens to be. */}
      {date && (
        <g strokeLinecap="round">
          <line
            x1={CX}
            y1={CY}
            x2={hourX}
            y2={hourY}
            stroke="var(--bg)"
            strokeWidth={3.8}
          />
          <line
            x1={CX}
            y1={CY}
            x2={hourX}
            y2={hourY}
            stroke="var(--text-h)"
            strokeWidth={2.4}
          />
          <line
            x1={CX}
            y1={CY}
            x2={minuteX}
            y2={minuteY}
            stroke="var(--bg)"
            strokeWidth={2.8}
          />
          <line
            x1={CX}
            y1={CY}
            x2={minuteX}
            y2={minuteY}
            stroke="var(--text-h)"
            strokeWidth={1.4}
          />
          <circle
            cx={CX}
            cy={CY}
            r={1.8}
            fill="var(--text-h)"
            stroke="var(--bg)"
            strokeWidth={0.8}
          />
        </g>
      )}
    </svg>
  );
}
