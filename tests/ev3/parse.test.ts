import { describe, expect, it } from 'vitest';
import { parseEv3 } from '../../src/ev3/index';

describe('EV3 parser', () => {
  // Header has 35 fields; events have 30 fields.
  const sampleEV3Content = `2024 Western Region SC Championships;Regional Aquatic Centre;2024-02-23;2024-02-25;2024-01-01;T;0.00;0.00;0.00;SDIF V3;HY-TEK 8.0;8.0.0;2024-02-01;;WR2024;;2024-01-01;0;200;10;2;7;A;2024-02-15;123 Main St;;Toronto;ON;M1M1M1;CAN;ON;N;;2024-02-01;12345
1;;P;1;I;F;11;12;50;FREE;;;;N;5.00;;30.50;;29.50;;28.00;1;1;1;09:00;2;100;10;0;0
2;;P;1;I;M;11;12;50;FREE;;;;N;5.00;;32.00;;31.00;;29.50;1;2;1;09:15;2;100;10;0;0
3;;T;1;I;F;13;14;100;BACK;;;;N;5.00;1:15.00;1:10.00;1:12.00;1:08.00;;1:05.00;1;3;1;10:00;2;100;10;0;0`;

  it('parses header correctly', () => {
    const { header } = parseEv3(sampleEV3Content);

    expect(header.meet_name).toBe('2024 Western Region SC Championships');
    expect(header.pool_name).toBe('Regional Aquatic Centre');
    expect(header.meet_start_date).toBe('2024-02-23');
    expect(header.meet_end_date).toBe('2024-02-25');
    expect(header.age_up_date).toBe('2024-01-01');
    expect(header.sanction_number).toBe('WR2024');
    expect(header.pool_city).toBe('Toronto');
    expect(header.pool_province).toBe('ON');
    expect(header.pool_country).toBe('CAN');
    expect(header.id_format).toBe('7'); // Canada
    expect(header.class).toBe('A'); // Age Group
  });

  it('surfaces a checksum warning when the header checksum does not match', () => {
    const invalidChecksumContent = sampleEV3Content.replace(/12345$/m, '99999*>');

    const result = parseEv3(invalidChecksumContent);
    const warning = result.warnings.find((w) => w.code === 'checksum-mismatch');
    expect(warning).toBeDefined();
    expect(warning!.message).toContain('EV3 checksum mismatch');
    expect(warning!.message).not.toContain('*>');
    expect(result.events).toHaveLength(3);
  });

  it('parses events with correct details', () => {
    const { events } = parseEv3(sampleEV3Content);
    expect(events).toHaveLength(3);

    const event1 = events[0]!;
    expect(event1.event_no).toBe('1');
    expect(event1.ind_or_relay).toBe('I');
    expect(event1.gender).toBe('F');
    expect(event1.min_age).toBe(11);
    expect(event1.max_age).toBe(12);
    expect(event1.distance).toBe('50');
    expect(event1.stroke).toBe('FREE');
    expect(event1.event_type).toBe('N');
  });

  it('normalizes gender codes', () => {
    const { events } = parseEv3(sampleEV3Content);
    expect(events[0]!.gender).toBe('F');
    expect(events[1]!.gender).toBe('M');
  });

  it('converts times to centiseconds', () => {
    const { events } = parseEv3(sampleEV3Content);
    const event1 = events[0]!;

    expect(event1.lcm_qt).toBe('30.50');
    expect(event1.lcm_qt_cs).toBe(3050);
    expect(event1.scm_qt).toBe('29.50');
    expect(event1.scm_qt_cs).toBe(2950);
  });

  it('handles times with minutes', () => {
    const { events } = parseEv3(sampleEV3Content);
    const event3 = events[2]!;

    expect(event3.lcm_dqt).toBe('1:15.00');
    expect(event3.lcm_dqt_cs).toBe(7500);
    expect(event3.lcm_qt).toBe('1:10.00');
    expect(event3.lcm_qt_cs).toBe(7000);
  });

  it('handles empty times as 0.00', () => {
    const { events } = parseEv3(sampleEV3Content);
    const event1 = events[0]!;

    expect(event1.lcm_dqt).toBe('0.00');
    expect(event1.lcm_dqt_cs).toBe(0);
    expect(event1.scm_dqt).toBe('0.00');
    expect(event1.scm_dqt_cs).toBe(0);
    expect(event1.scy_dqt).toBe('0.00');
    expect(event1.scy_dqt_cs).toBe(0);
  });

  it('parses session information', () => {
    const { events } = parseEv3(sampleEV3Content);
    const event1 = events[0]!;

    expect(event1.session_number).toBe('1');
    expect(event1.session_event).toBe('1');
    expect(event1.session_meet_day).toBe('1');
    expect(event1.session_start_time).toBe('09:00');
    expect(event1.session_course).toBe('2'); // SCM
  });

  it('rejects empty content', () => {
    expect(() => parseEv3('')).toThrow('EV3 content is empty');
  });

  it('handles content with only a header', () => {
    const headerOnly = `2024 Test Meet;Test Pool;2024-01-01;2024-01-01;2024-01-01;T;0;0;0;SDIF;HY-TEK;8.0;2024-01-01;;;;;2024-01-01;0;100;10;2;7;A;2024-01-01;123 St;;City;ON;M1M1M1;CAN;ON;N;;2024-01-01;12345`;

    const result = parseEv3(headerOnly);
    expect(result.header.meet_name).toBe('2024 Test Meet');
    expect(result.events).toHaveLength(0);
  });

  it('parses all event fields', () => {
    const { events } = parseEv3(sampleEV3Content);
    const event = events[0]!;

    for (const prop of [
      'event_no',
      'subevent_no',
      'prelims_finals',
      'rounds',
      'ind_or_relay',
      'gender',
      'min_age',
      'max_age',
      'distance',
      'stroke',
      'event_type',
      'event_fee',
      'lcm_qt',
      'lcm_dqt',
      'scm_qt',
      'scm_dqt',
      'scy_qt',
      'scy_dqt',
      'lcm_qt_cs',
      'lcm_dqt_cs',
      'scm_qt_cs',
      'scm_dqt_cs',
      'scy_qt_cs',
      'scy_dqt_cs',
      'session_number',
      'session_event',
      'session_meet_day',
      'session_start_time',
      'session_course',
      'max_entries',
      'max_individual_entries',
      'max_relay_entries',
      'relay_team_members',
    ]) {
      expect(event, prop).toHaveProperty(prop);
    }
  });
});
