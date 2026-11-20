import { useState } from 'react'
import { Card, Row, Col, Button, Modal, Form, Input, Tag, Space, Empty, message } from 'antd'
import { PlusOutlined, FolderOutlined, FolderOpenOutlined } from '@ant-design/icons'

// 项目管理页组件（第五课：接入 Electron 原生目录选择与打开能力）
export default function Projects({ projectList = [], onAddProject }) {
  // 控制“新建项目”弹窗的显示与隐藏
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Ant Design 表单实例（用于手动重置与回填表单字段）
  const [form] = Form.useForm()

  // 点击“新建项目”按钮
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  // 取消关闭弹窗
  const handleCloseModal = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  // 调用 Electron 原生窗口选择本地文件夹
  const handleXuanzeMulu = async () => {
    if (!window.api?.selectFolder) {
      message.warning('当前环境不支持原生文件夹选择')
      return
    }
    const xuanzhongLujing = await window.api.selectFolder()
    console.log('+++++++', '选择本地项目文件夹返回：', xuanzhongLujing)
    if (xuanzhongLujing) {
      form.setFieldsValue({ folderPath: xuanzhongLujing })
    }
  }

  // 调用 Electron 在 Windows 资源管理器中打开项目目录
  const handleDakaiMulu = async (mubiaoLujing) => {
    console.log('*-*-*-*', '点击打开本地项目目录：', mubiaoLujing)
    if (!window.api?.openFolder) {
      message.warning('当前环境不支持打开本地目录')
      return
    }
    const jieguo = await window.api.openFolder(mubiaoLujing)
    if (!jieguo?.success) {
      message.warning(jieguo?.message || '打开目录失败，请检查文件夹路径是否存在')
    }
  }

  // 弹窗表单校验通过，点击“确定”提交
  const handleFormFinish = (values) => {
    console.log('-------', '创建新项目表单数据：', values)

    const muluLujing = values.folderPath ? values.folderPath.trim() : ''

    // 组装新项目数据对象
    const newProject = {
      id: `p_${Date.now()}`,
      name: values.name,
      course: values.course,
      description: values.description || '暂无简介描述',
      folderPath: muluLujing || '待关联本地文件夹',
      createdAt: new Date().toISOString().split('T')[0]
    }

    // 调用父组件传入的回调函数，将新项目加入数据源并持久化
    if (onAddProject) {
      onAddProject(newProject)
    }

    // 关闭弹窗并清空输入框
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <div className="xiangmuguanli">
      {/* 1. 顶部操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>我的教学项目</h2>
          <span style={{ color: '#8c8c8c', fontSize: '13px' }}>
            共管理 {projectList.length} 个进行中的实训项目
          </span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
          新建项目
        </Button>
      </div>

      {/* 2. 项目卡片网格列表（无数据时展示友好空状态引导） */}
      {projectList.length === 0 ? (
        <Empty
          style={{ marginTop: 60 }}
          description="暂无教学实训项目，点击右上角「新建项目」创建第一个项目！"
        />
      ) : (
        <Row gutter={[16, 16]}>
          {projectList.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                title={<span style={{ fontWeight: 'bold' }}>{item.name}</span>}
                extra={<Tag color="blue">{item.course}</Tag>}
                style={{ height: '100%' }}
              >
                {/* 项目简介 */}
                <p
                  style={{
                    color: '#595959',
                    minHeight: '42px',
                    lineHeight: '21px',
                    margin: '0 0 12px 0'
                  }}
                >
                  {item.description}
                </p>

                {/* 本地目录展示与一键打开按钮 */}
                <div
                  className="xiangmumuluqu"
                  style={{
                    fontSize: '12px',
                    color: '#8c8c8c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      overflow: 'hidden',
                      flex: 1
                    }}
                  >
                    <FolderOutlined />
                    <span
                      title={item.folderPath}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.folderPath}
                    </span>
                  </div>

                  <Button
                    type="link"
                    size="small"
                    icon={<FolderOpenOutlined />}
                    onClick={() => handleDakaiMulu(item.folderPath)}
                    style={{ padding: '0 4px', flexShrink: 0 }}
                  >
                    打开目录
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 3. 新建项目 Modal 对话框 */}
      <Modal
        title="新建教学实训项目"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称！' }]}
          >
            <Input placeholder="例如：金融数据上链存证系统" />
          </Form.Item>

          <Form.Item
            label="所属课程"
            name="course"
            rules={[{ required: true, message: '请输入所属课程名称！' }]}
          >
            <Input placeholder="例如：区块链技术原理及应用" />
          </Form.Item>

          <Form.Item label="本地项目目录">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="folderPath" noStyle>
                <Input placeholder="请点击右侧按钮选择项目文件夹（选填）" />
              </Form.Item>
              <Button icon={<FolderOpenOutlined />} onClick={handleXuanzeMulu}>
                选择文件夹
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="项目简介" name="description">
            <Input.TextArea
              rows={3}
              placeholder="简要描述项目的核心目标、技术栈或成果要求（选填）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
