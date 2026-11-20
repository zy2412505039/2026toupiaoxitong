import { Card, Row, Col, Statistic, Progress, Button, Tag, Empty, Space } from 'antd'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  RightOutlined
} from '@ant-design/icons'
import './Dashboard.css'
// 第四节课：工作台首页（实训进度概览与数据看板）
export default function Dashboard({ projectList = [], onMenuChange }) {
  // 1. 直观按步骤统计项目与任务数据（避免复杂链式，清晰展示处理逻辑）
  const xiangmuZongshu = projectList.length
  let renwuZongshu = 0
  let yiwanchengRenwushu = 0
  for (let i = 0; i < projectList.length; i++) {
    const xiangmuItem = projectList[i]
    const renwuLiebiao = xiangmuItem.tasks || []
    renwuZongshu += renwuLiebiao.length

    for (let j = 0; j < renwuLiebiao.length; j++) {
      if (renwuLiebiao[j].completed) {
        yiwanchengRenwushu += 1
      }
    }
  }
  // 计算整体平均完成率
  let pingjunJindu = 0
  if (renwuZongshu > 0) {
    pingjunJindu = Math.round((yiwanchengRenwushu / renwuZongshu) * 100)
  }
  // 待推进的任务数
  const daituijinRenwushu = renwuZongshu - yiwanchengRenwushu
  // 2. 快捷跳转处理函数
  const handleTiaozhuan = (caidanKey) => {
    console.log('*-*-*-*', '工作台快捷跳转目标页面：', caidanKey)
    if (onMenuChange) {
      onMenuChange(caidanKey)
    }
  }
  console.log(
    '=======',
    '工作台首页加载统计数据，项目总数：',
    xiangmuZongshu,
    '，任务总数：',
    renwuZongshu,
    '，平均进度：',
    `${pingjunJindu}%`
  )
  return (
    <div className="gongzuotaishouye">
      {/* 顶部标题与说明 */}
      <div className="biaotiquyu">
        <h2>实训教学工作台</h2>
        <span className="fubiaoti">汇总全部实训项目进度、任务完成指标与快捷工作通道</span>
      </div>
      {/* 1. 四大核心数据统计指标卡片（静态纯净展示，无悬浮态） */}
      <Row gutter={[16, 16]} className="tongjikaquyu">
        <Col xs={24} sm={12} lg={6}>
          <Card className="tongjikaxiangmu">
            <Statistic
              title="实训项目总数"
              value={xiangmuZongshu}
              suffix="个"
              prefix={<ProjectOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="tongjikarenwu">
            <Statistic
              title="实训任务总数"
              value={renwuZongshu}
              suffix="项"
              prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="tongjikawancheng">
            <Statistic
              title="已完成任务"
              value={yiwanchengRenwushu}
              suffix="项"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="tongjikajindu">
            <Statistic
              title="整体实训完成率"
              value={pingjunJindu}
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>
      {/* 2. 主体内容：左侧项目进展列表 + 右侧快捷操作 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：各项目实训推进进度看板 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <ProjectOutlined style={{ color: '#1677ff' }} />
                <span>实训项目推进进度看板</span>
              </Space>
            }
            extra={
              <span className="daituijintishi">
                待推进任务：<b className="daituijinshuzi">{daituijinRenwushu}</b> 项
              </span>
            }
            className="jindukanbanquyu"
          >
            {projectList.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无进行中的实训项目，请先创建项目！"
              />
            ) : (
              <div className="xiangmuliebiao">
                {projectList.map((xiangmuItem) => {
                  const renwuList = xiangmuItem.tasks || []
                  const zongshu = renwuList.length
                  let wanchengCount = 0

                  for (let k = 0; k < renwuList.length; k++) {
                    if (renwuList[k].completed) {
                      wanchengCount += 1
                    }
                  }
                  const jinduBaifenbi =
                    zongshu === 0 ? 0 : Math.round((wanchengCount / zongshu) * 100)
                  return (
                    <div key={xiangmuItem.id} className="xiangmutiaomu">
                      <div className="xiangmutoubu">
                        <div>
                          <span className="xiangmumingcheng">{xiangmuItem.name}</span>
                          <Tag color="blue">{xiangmuItem.course}</Tag>
                        </div>
                        <div className="xiangmutongji">
                          <span>
                            已完成：<b>{wanchengCount}</b> / {zongshu} 项
                          </span>
                          <span className="fengefu">|</span>
                          <span className={jinduBaifenbi === 100 ? 'wanchengzishu' : 'jinduzishu'}>
                            完成度：<b>{jinduBaifenbi}%</b>
                          </span>
                        </div>
                      </div>
                      {/* 专属渐变进度条 */}
                      <Progress
                        percent={jinduBaifenbi}
                        status={jinduBaifenbi === 100 ? 'success' : 'active'}
                        strokeColor={{ '0%': '#108ee9', '100%': '#52c41a' }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </Col>
        {/* 右侧：快捷工作通道与提示说明 */}
        <Col xs={24} lg={8}>
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Card
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#722ed1' }} />
                  <span>快捷工作通道</span>
                </Space>
              }
              className="kuaijiequyu"
            >
              <Space orientation="vertical" style={{ width: '100%' }} size={12}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => handleTiaozhuan('projects')}
                >
                  创建新实训项目
                </Button>
                <Button
                  block
                  size="large"
                  icon={<RightOutlined />}
                  onClick={() => handleTiaozhuan('tasks')}
                >
                  进入任务清单管理
                </Button>
              </Space>
            </Card>
            <Card className="tishikinpian">
              <div className="tishibiaoti">💡 项目制实训小贴士</div>
              <p className="tishineirong">
                工作台的数据与「项目管理」「任务管理」实时动态联动。在任务管理中每打钩完成一项任务，此处的平均进度与各项目完成率将自动同步刷新！
              </p>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}
