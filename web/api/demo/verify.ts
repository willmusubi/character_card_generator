import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { inviteCode } = req.body;

  if (!inviteCode || typeof inviteCode !== 'string') {
    return res.status(400).json({ valid: false, error: '请输入邀请码' });
  }

  // 从环境变量获取有效邀请码列表
  const validCodes = (process.env.DEMO_INVITE_CODES || '')
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length > 0);

  if (validCodes.length === 0) {
    console.error('[Demo Verify] DEMO_INVITE_CODES 环境变量未配置');
    return res.status(500).json({ valid: false, error: '抢先体验功能暂未开放' });
  }

  const isValid = validCodes.includes(inviteCode.trim());

  console.log(`[Demo Verify] 邀请码验证: ${inviteCode.substring(0, 4)}*** -> ${isValid ? '有效' : '无效'}`);

  if (isValid) {
    return res.status(200).json({ valid: true });
  } else {
    return res.status(401).json({ valid: false, error: '邀请码无效' });
  }
}
