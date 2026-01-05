# -*- coding: utf-8 -*-
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib
from matplotlib import font_manager
import numpy as np

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

# 设置样式
sns.set_style("whitegrid")
sns.set_palette("husl")

# 读取数据
df = pd.read_excel(r'C:\Users\chenyuguang001\Desktop\seed1.6成本.xlsx')

# 提取关键列
df_clean = df[['教练姓名', 'token', '陈本']].copy()
df_clean = df_clean.dropna()
df_clean['成本'] = df_clean['陈本']

print("创建可视化图表...")

# 创建图表目录
import os
output_dir = r'C:\Users\chenyuguang001\个人项目\代办事项web\charts'
os.makedirs(output_dir, exist_ok=True)

# ==================== 图表 1: 成本分布 ====================
fig, ax = plt.subplots(figsize=(12, 6))
colors = sns.color_palette("RdYlGn_r", len(df_clean))
bars = ax.bar(range(len(df_clean)), df_clean['成本'], color=colors, edgecolor='black', linewidth=1.5)

# 添加数值标签
for i, (bar, cost) in enumerate(zip(bars, df_clean['成本'])):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'${cost:.3f}',
            ha='center', va='bottom', fontsize=10, fontweight='bold')

ax.set_xlabel('课程序号', fontsize=12, fontweight='bold')
ax.set_ylabel('成本 (USD)', fontsize=12, fontweight='bold')
ax.set_title('Seed 1.6 成本分布 - 单次分析成本波动明显', fontsize=14, fontweight='bold', pad=20)
ax.axhline(y=df_clean['成本'].mean(), color='red', linestyle='--', linewidth=2, label=f'平均值: ${df_clean["成本"].mean():.3f}')
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(f'{output_dir}/1_cost_distribution.png', dpi=300, bbox_inches='tight')
print("[OK] 保存图表 1: 成本分布")
plt.close()

# ==================== 图表 2: Token vs 成本散点图 ====================
fig, ax = plt.subplots(figsize=(10, 6))

scatter = ax.scatter(df_clean['token'], df_clean['成本'],
                     s=200, c=df_clean['成本'], cmap='RdYlGn_r',
                     alpha=0.7, edgecolors='black', linewidth=1.5)

# 添加趋势线
z = np.polyfit(df_clean['token'], df_clean['成本'], 1)
p = np.poly1d(z)
ax.plot(df_clean['token'], p(df_clean['token']), "r--", linewidth=2, label='趋势线', alpha=0.8)

# 添加标签
for i, row in df_clean.iterrows():
    ax.annotate(f"{i+1}", (row['token'], row['成本']),
                xytext=(5, 5), textcoords='offset points', fontsize=9)

ax.set_xlabel('Token 消耗量', fontsize=12, fontweight='bold')
ax.set_ylabel('成本 (USD)', fontsize=12, fontweight='bold')
ax.set_title('Token 使用量 vs 成本关系', fontsize=14, fontweight='bold', pad=20)
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)

plt.colorbar(scatter, label='成本 (USD)', ax=ax)
plt.tight_layout()
plt.savefig(f'{output_dir}/2_token_vs_cost.png', dpi=300, bbox_inches='tight')
print("[OK] 保存图表 2: Token vs 成本")
plt.close()

# ==================== 图表 3: 成本区间分布 ====================
fig, ax = plt.subplots(figsize=(10, 6))

# 创建成本区间
bins = [0, 0.03, 0.06, 0.09, 0.12, 0.15]
labels = ['$0.00-0.03', '$0.03-0.06', '$0.06-0.09', '$0.09-0.12', '$0.12-0.15']
df_clean['成本区间'] = pd.cut(df_clean['成本'], bins=bins, labels=labels, include_lowest=True)

# 统计每个区间的数量
cost_distribution = df_clean['成本区间'].value_counts().sort_index()

bars = ax.barh(range(len(cost_distribution)), cost_distribution.values,
               color=sns.color_palette("RdYlGn_r", len(cost_distribution)),
               edgecolor='black', linewidth=1.5)

# 添加数值和百分比标签
total = cost_distribution.sum()
for i, (bar, count) in enumerate(zip(bars, cost_distribution.values)):
    width = bar.get_width()
    percentage = (count / total) * 100
    ax.text(width + 0.1, bar.get_y() + bar.get_height()/2,
            f'{count}次 ({percentage:.1f}%)',
            ha='left', va='center', fontsize=11, fontweight='bold')

ax.set_yticks(range(len(cost_distribution)))
ax.set_yticklabels(cost_distribution.index)
ax.set_xlabel('课程数量', fontsize=12, fontweight='bold')
ax.set_ylabel('成本区间', fontsize=12, fontweight='bold')
ax.set_title('成本区间分布 - 33%的课程成本在$0.06-0.09', fontsize=14, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='x')

plt.tight_layout()
plt.savefig(f'{output_dir}/3_cost_range_distribution.png', dpi=300, bbox_inches='tight')
print("[OK] 保存图表 3: 成本区间分布")
plt.close()

# ==================== 图表 4: 统计仪表板 ====================
fig = plt.figure(figsize=(14, 8))
gs = fig.add_gridspec(2, 3, hspace=0.3, wspace=0.3)

# 4.1 成本箱型图
ax1 = fig.add_subplot(gs[0, 0])
bp = ax1.boxplot([df_clean['成本']], vert=True, patch_artist=True,
                  boxprops=dict(facecolor='lightblue', edgecolor='black', linewidth=2),
                  medianprops=dict(color='red', linewidth=2),
                  whiskerprops=dict(color='black', linewidth=1.5),
                  capprops=dict(color='black', linewidth=1.5))
ax1.set_ylabel('成本 (USD)', fontsize=11, fontweight='bold')
ax1.set_title('成本箱型图', fontsize=12, fontweight='bold')
ax1.grid(True, alpha=0.3)

# 添加统计值标注
stats_text = f"中位数: ${df_clean['成本'].median():.3f}\n平均值: ${df_clean['成本'].mean():.3f}"
ax1.text(1.3, df_clean['成本'].median(), stats_text, fontsize=10, va='center')

# 4.2 Token 分布直方图
ax2 = fig.add_subplot(gs[0, 1])
ax2.hist(df_clean['token'], bins=8, color='skyblue', edgecolor='black', linewidth=1.5, alpha=0.7)
ax2.axvline(df_clean['token'].mean(), color='red', linestyle='--', linewidth=2, label=f'平均: {df_clean["token"].mean():.0f}')
ax2.set_xlabel('Token 数量', fontsize=11, fontweight='bold')
ax2.set_ylabel('频率', fontsize=11, fontweight='bold')
ax2.set_title('Token 使用量分布', fontsize=12, fontweight='bold')
ax2.legend(fontsize=10)
ax2.grid(True, alpha=0.3)

# 4.3 成本饼图
ax3 = fig.add_subplot(gs[0, 2])
sizes = cost_distribution.values
colors_pie = sns.color_palette("RdYlGn_r", len(sizes))
explode = [0.05 if i == sizes.argmax() else 0 for i in range(len(sizes))]
wedges, texts, autotexts = ax3.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
                                     colors=colors_pie, startangle=90, textprops={'fontsize': 10, 'fontweight': 'bold'})
ax3.set_title('成本区间占比', fontsize=12, fontweight='bold')

# 4.4 累计成本曲线
ax4 = fig.add_subplot(gs[1, :])
cumulative_cost = df_clean['成本'].cumsum()
ax4.plot(range(1, len(cumulative_cost)+1), cumulative_cost,
         marker='o', linewidth=2.5, markersize=8, color='#2E86AB')
ax4.fill_between(range(1, len(cumulative_cost)+1), cumulative_cost, alpha=0.3, color='#2E86AB')

# 添加数据点标签
for i, cost in enumerate(cumulative_cost):
    ax4.text(i+1, cost, f'${cost:.3f}', ha='center', va='bottom', fontsize=9)

ax4.set_xlabel('课程序号', fontsize=11, fontweight='bold')
ax4.set_ylabel('累计成本 (USD)', fontsize=11, fontweight='bold')
ax4.set_title(f'累计成本趋势 - 总计: ${cumulative_cost.iloc[-1]:.3f}', fontsize=12, fontweight='bold')
ax4.grid(True, alpha=0.3)
ax4.set_xticks(range(1, len(cumulative_cost)+1))

plt.suptitle('Seed 1.6 成本分析仪表板', fontsize=16, fontweight='bold', y=0.98)
plt.tight_layout()
plt.savefig(f'{output_dir}/4_dashboard.png', dpi=300, bbox_inches='tight')
print("[OK] 保存图表 4: 统计仪表板")
plt.close()

# ==================== 图表 5: ROI 对比 ====================
fig, ax = plt.subplots(figsize=(10, 6))

# 数据
categories = ['人工审核\n(¥60/次)', f'AI审核\n(${df_clean["成本"].mean():.3f}/次)', '优化后AI\n($0.035/次)']
costs_rmb = [60, df_clean['成本'].mean() * 7.2, 0.035 * 7.2]  # 转换为人民币
colors_roi = ['#E63946', '#F4A261', '#2A9D8F']

bars = ax.bar(categories, costs_rmb, color=colors_roi, edgecolor='black', linewidth=2, width=0.6)

# 添加数值标签
for bar, cost in zip(bars, costs_rmb):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'¥{cost:.2f}',
            ha='center', va='bottom', fontsize=12, fontweight='bold')

# 添加节省百分比
savings_current = (1 - costs_rmb[1]/costs_rmb[0]) * 100
savings_optimized = (1 - costs_rmb[2]/costs_rmb[0]) * 100

ax.text(0.5, costs_rmb[0]/2, f'节省\n{savings_current:.1f}%',
        ha='center', va='center', fontsize=11, fontweight='bold', color='white')
ax.text(1.5, costs_rmb[0]/2, f'额外节省\n{(savings_optimized-savings_current):.1f}%',
        ha='center', va='center', fontsize=11, fontweight='bold', color='white')

ax.set_ylabel('单次成本 (人民币)', fontsize=12, fontweight='bold')
ax.set_title('ROI 对比分析 - AI 相比人工节省 99.3%', fontsize=14, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig(f'{output_dir}/5_roi_comparison.png', dpi=300, bbox_inches='tight')
print("[OK] 保存图表 5: ROI 对比")
plt.close()

print(f"\n所有图表已保存到: {output_dir}")
print(f"共生成 5 组可视化图表")

# 生成摘要统计
print("\n" + "="*60)
print("数据摘要统计")
print("="*60)
print(f"总样本数: {len(df_clean)}")
print(f"总成本: ${df_clean['成本'].sum():.3f}")
print(f"平均成本: ${df_clean['成本'].mean():.3f}")
print(f"中位数成本: ${df_clean['成本'].median():.3f}")
print(f"最高成本: ${df_clean['成本'].max():.3f}")
print(f"最低成本: ${df_clean['成本'].min():.3f}")
print(f"成本标准差: ${df_clean['成本'].std():.3f}")
print(f"成本波动率: {(df_clean['成本'].max() / df_clean['成本'].min() - 1) * 100:.1f}%")
print(f"\n平均 Token: {df_clean['token'].mean():.0f}")
print(f"Token 标准差: {df_clean['token'].std():.0f}")
print("="*60)
