import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRoundPreview, generateRoundPayments, getRoundCollectionStats } from './huiCalculator';
import type { HuiGroup, HuiRound } from '../types/hui';

function group(firstPotRule: HuiGroup['firstPotRule'] = 'auction'): HuiGroup {
  return {
    id: 'g1', name: 'Test', baseAmount: 1_000_000, totalShares: 4,
    cycle: 'monthly', startDate: '2026-01-01', commissionDefault: 100_000,
    firstPotRule, status: 'active',
    members: [{id:'m1',name:'A',sharesCount:1},{id:'m2',name:'B',sharesCount:1},{id:'m3',name:'C',sharesCount:1},{id:'m4',name:'D',sharesCount:1}],
    shares: [
      {id:'s1',memberId:'m1',memberName:'A',shareIndex:1,isDead:true},
      {id:'s2',memberId:'m2',memberName:'B',shareIndex:1,isDead:false},
      {id:'s3',memberId:'m3',memberName:'C',shareIndex:1,isDead:false},
      {id:'s4',memberId:'m4',memberName:'D',shareIndex:1,isDead:false},
    ],
    rounds: [], currentRoundNumber: 0, createdAt: '2026-01-01',
  };
}

test('owner-first opening round ignores auction bid in preview and payment rows', () => {
  const g = group('owner_first');
  const preview = calculateRoundPreview(g, 1, 's2', 250_000, 100_000);
  const payments = generateRoundPayments(g, 's2', 250_000);
  assert.equal(preview.bidAmount, 0);
  assert.equal(preview.liveAmountDue, 1_000_000);
  assert.equal(preview.netWinnerPayout, 2_900_000);
  assert.equal(payments.find(p => p.shareId === 's3')?.amountDue, 1_000_000);
});

test('auction round deducts bid only from live shares; dead shares pay base amount', () => {
  const g = group('auction');
  const preview = calculateRoundPreview(g, 1, 's2', 200_000, 100_000);
  const payments = generateRoundPayments(g, 's2', 200_000);
  assert.equal(preview.liveAmountDue, 800_000);
  assert.equal(preview.deadAmountDue, 1_000_000);
  assert.equal(payments.find(p => p.shareId === 's1')?.amountDue, 1_000_000);
  assert.equal(payments.find(p => p.shareId === 's3')?.amountDue, 800_000);
  assert.equal(payments.find(p => p.shareId === 's2')?.amountDue, 0);
});

test('collection statistics exclude winner and calculate pending amount', () => {
  const round: HuiRound = {
    id:'r1', roundNumber:1, date:'2026-01-01', status:'collecting',
    bidAmount:100_000, winnerShareId:'s1', commissionAmount:0, firstRoundDeduction:0,
    netWinnerPayout:0, isPayoutCompleted:false,
    payments:[
      {shareId:'s1',memberId:'m1',memberName:'A',shareIndex:1,isLive:false,isWinnerThisRound:true,amountDue:0,isPaid:true},
      {shareId:'s2',memberId:'m2',memberName:'B',shareIndex:1,isLive:true,isWinnerThisRound:false,amountDue:900_000,isPaid:true},
      {shareId:'s3',memberId:'m3',memberName:'C',shareIndex:1,isLive:true,isWinnerThisRound:false,amountDue:900_000,isPaid:false},
    ],
  };
  const stats = getRoundCollectionStats(round);
  assert.equal(stats.totalDue, 1_800_000);
  assert.equal(stats.totalCollected, 900_000);
  assert.equal(stats.pendingAmount, 900_000);
  assert.equal(stats.progressPercent, 50);
});
