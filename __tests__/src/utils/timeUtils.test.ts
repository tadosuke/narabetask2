import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  generateTimeSlots,
  formatDuration,
  isWithinWorkingHours,
} from '../../../src/utils/timeUtils';

describe('timeUtils', () => {
  describe('timeToMinutes', () => {
    describe('Normal cases', () => {
      it('converts standard time formats correctly', () => {
        expect(timeToMinutes('09:00')).toBe(540);
        expect(timeToMinutes('12:30')).toBe(750);
        expect(timeToMinutes('18:45')).toBe(1125);
        expect(timeToMinutes('00:00')).toBe(0);
        expect(timeToMinutes('23:59')).toBe(1439);
      });

      it('handles quarter-hour increments correctly', () => {
        expect(timeToMinutes('09:15')).toBe(555);
        expect(timeToMinutes('09:30')).toBe(570);
        expect(timeToMinutes('09:45')).toBe(585);
      });
    });

    describe('Boundary values', () => {
      it('handles start and end of day correctly', () => {
        expect(timeToMinutes('00:00')).toBe(0);
        expect(timeToMinutes('23:59')).toBe(1439);
      });

      it('handles noon and midnight correctly', () => {
        expect(timeToMinutes('12:00')).toBe(720);
        expect(timeToMinutes('00:00')).toBe(0);
      });
    });

    describe('Edge cases', () => {
      it('handles single digit hours and minutes with leading zeros', () => {
        expect(timeToMinutes('01:05')).toBe(65);
        expect(timeToMinutes('05:01')).toBe(301);
      });
    });
  });

  describe('minutesToTime', () => {
    describe('Normal cases', () => {
      it('converts minutes to time format correctly', () => {
        expect(minutesToTime(540)).toBe('09:00');
        expect(minutesToTime(750)).toBe('12:30');
        expect(minutesToTime(1125)).toBe('18:45');
        expect(minutesToTime(0)).toBe('00:00');
        expect(minutesToTime(1439)).toBe('23:59');
      });

      it('handles quarter-hour increments correctly', () => {
        expect(minutesToTime(555)).toBe('09:15');
        expect(minutesToTime(570)).toBe('09:30');
        expect(minutesToTime(585)).toBe('09:45');
      });
    });

    describe('Boundary values', () => {
      it('handles start and end of day correctly', () => {
        expect(minutesToTime(0)).toBe('00:00');
        expect(minutesToTime(1439)).toBe('23:59');
      });

      it('handles noon correctly', () => {
        expect(minutesToTime(720)).toBe('12:00');
      });
    });

    describe('Edge cases', () => {
      it('formats single digit hours and minutes with leading zeros', () => {
        expect(minutesToTime(65)).toBe('01:05');
        expect(minutesToTime(301)).toBe('05:01');
      });
    });
  });

  describe('timeToMinutes and minutesToTime roundtrip', () => {
    it('should be reversible for standard times', () => {
      const testTimes = ['09:00', '12:30', '18:45', '00:00', '23:59'];
      testTimes.forEach((time) => {
        expect(minutesToTime(timeToMinutes(time))).toBe(time);
      });
    });

    it('should be reversible for quarter-hour increments', () => {
      const testMinutes = [0, 15, 30, 45, 60, 75, 90, 105];
      testMinutes.forEach((minutes) => {
        expect(timeToMinutes(minutesToTime(minutes))).toBe(minutes);
      });
    });
  });

  describe('generateTimeSlots', () => {
    describe('Normal cases', () => {
      it('generates correct time slots for standard working hours', () => {
        const slots = generateTimeSlots('09:00', '10:00');
        expect(slots).toEqual(['09:00', '09:15', '09:30', '09:45']);
      });

      it('generates slots for longer periods correctly', () => {
        const slots = generateTimeSlots('09:00', '11:00');
        expect(slots).toEqual([
          '09:00',
          '09:15',
          '09:30',
          '09:45',
          '10:00',
          '10:15',
          '10:30',
          '10:45',
        ]);
      });

      it('generates slots across noon correctly', () => {
        const slots = generateTimeSlots('11:45', '12:15');
        expect(slots).toEqual(['11:45', '12:00']);
      });
    });

    describe('Boundary values', () => {
      it('handles same start and end time', () => {
        const slots = generateTimeSlots('09:00', '09:00');
        expect(slots).toEqual([]);
      });

      it('handles minimum 15-minute interval', () => {
        const slots = generateTimeSlots('09:00', '09:15');
        expect(slots).toEqual(['09:00']);
      });
    });

    describe('Edge cases', () => {
      it('handles non-quarter-hour start times', () => {
        const slots = generateTimeSlots('09:05', '09:35');
        expect(slots).toEqual(['09:05', '09:20']);
      });

      it('generates correct number of slots', () => {
        const slots = generateTimeSlots('09:00', '18:00');
        expect(slots).toHaveLength(36); // 9 hours * 4 slots per hour
      });
    });
  });

  describe('formatDuration', () => {
    describe('Normal cases', () => {
      it('formats duration in hours correctly', () => {
        expect(formatDuration(4)).toBe('1時間'); // 4 * 15 = 60 minutes
        expect(formatDuration(8)).toBe('2時間'); // 8 * 15 = 120 minutes
      });

      it('formats duration in minutes correctly', () => {
        expect(formatDuration(1)).toBe('15分'); // 1 * 15 = 15 minutes
        expect(formatDuration(2)).toBe('30分'); // 2 * 15 = 30 minutes
        expect(formatDuration(3)).toBe('45分'); // 3 * 15 = 45 minutes
      });

      it('formats duration in hours and minutes correctly', () => {
        expect(formatDuration(5)).toBe('1時間15分'); // 5 * 15 = 75 minutes
        expect(formatDuration(6)).toBe('1時間30分'); // 6 * 15 = 90 minutes
        expect(formatDuration(9)).toBe('2時間15分'); // 9 * 15 = 135 minutes
      });
    });

    describe('Boundary values', () => {
      it('handles zero duration', () => {
        expect(formatDuration(0)).toBe('0分');
      });

      it('handles single 15-minute increment', () => {
        expect(formatDuration(1)).toBe('15分');
      });
    });

    describe('Edge cases', () => {
      it('handles large durations correctly', () => {
        expect(formatDuration(32)).toBe('8時間'); // 32 * 15 = 480 minutes = 8 hours
        expect(formatDuration(33)).toBe('8時間15分'); // 33 * 15 = 495 minutes = 8 hours 15 minutes
      });
    });
  });

  describe('isWithinWorkingHours', () => {
    describe('Normal cases', () => {
      it('returns true for tasks within working hours', () => {
        expect(isWithinWorkingHours('09:00', 4, '08:00', '18:00')).toBe(true); // 09:00-10:00 within 08:00-18:00
        expect(isWithinWorkingHours('12:00', 2, '09:00', '17:00')).toBe(true); // 12:00-12:30 within 09:00-17:00
      });

      it('returns false for tasks starting before working hours', () => {
        expect(isWithinWorkingHours('07:00', 4, '08:00', '18:00')).toBe(false); // 07:00-08:00, starts before 08:00
      });

      it('returns false for tasks ending after working hours', () => {
        expect(isWithinWorkingHours('17:30', 4, '08:00', '18:00')).toBe(false); // 17:30-18:30, ends after 18:00
      });

      it('returns false for tasks completely outside working hours', () => {
        expect(isWithinWorkingHours('19:00', 4, '08:00', '18:00')).toBe(false); // 19:00-20:00, completely after 18:00
        expect(isWithinWorkingHours('06:00', 4, '08:00', '18:00')).toBe(false); // 06:00-07:00, completely before 08:00
      });
    });

    describe('Boundary values', () => {
      it('returns true for tasks exactly at working hour boundaries', () => {
        expect(isWithinWorkingHours('08:00', 4, '08:00', '18:00')).toBe(true); // 08:00-09:00, starts exactly at 08:00
        expect(isWithinWorkingHours('17:00', 4, '08:00', '18:00')).toBe(true); // 17:00-18:00, ends exactly at 18:00
      });

      it('returns false for tasks that exactly exceed boundaries', () => {
        expect(isWithinWorkingHours('17:45', 2, '08:00', '18:00')).toBe(false); // 17:45-18:15, exceeds by 15 minutes
      });

      it('handles zero duration tasks', () => {
        expect(isWithinWorkingHours('12:00', 0, '08:00', '18:00')).toBe(true); // 0-duration task at 12:00
      });
    });

    describe('Edge cases', () => {
      it('handles tasks spanning the entire working day', () => {
        expect(isWithinWorkingHours('08:00', 40, '08:00', '18:00')).toBe(true); // 40 * 15 = 600 minutes = 10 hours
      });

      it('handles tasks longer than working day', () => {
        expect(isWithinWorkingHours('08:00', 48, '08:00', '18:00')).toBe(false); // 48 * 15 = 720 minutes = 12 hours
      });

      it('handles overnight working hours', () => {
        expect(isWithinWorkingHours('22:00', 4, '20:00', '02:00')).toBe(false); // This case would need special handling for overnight shifts
      });
    });
  });
});
