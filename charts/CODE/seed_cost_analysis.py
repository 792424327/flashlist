# -*- coding: utf-8 -*-
import pandas as pd
import json
from datetime import datetime

# 读取 Excel 文件
file_path = r'C:\Users\chenyuguang001\Desktop\seed1.6成本.xlsx'
df = pd.read_excel(file_path)

# 基本信息
print("=" * 80)
print("Seed 1.6 成本数据分析报告")
print("=" * 80)
print(f"\n生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"数据行数: {len(df)}")
print(f"数据列数: {len(df.columns)}")

# 显示列名（处理编码）
print("\n" + "=" * 80)
print("数据结构")
print("=" * 80)
print(f"列名: {df.columns.tolist()}")

# 数据预览（前5行）
print("\n" + "=" * 80)
print("数据预览（前5行）")
print("=" * 80)
print(df.head().to_string())

# 查找包含 token 的列
token_col = None
for col in df.columns:
    if 'token' in str(col).lower():
        token_col = col
        break

print(f"\n找到 token 列: {token_col}")

# 基本统计分析
if token_col:
    print("\n" + "=" * 80)
    print("Token 使用统计")
    print("=" * 80)

    token_stats = df[token_col].describe()
    print(f"总计: {df[token_col].sum():,.0f}")
    print(f"平均值: {df[token_col].mean():,.0f}")
    print(f"中位数: {df[token_col].median():,.0f}")
    print(f"最大值: {df[token_col].max():,.0f}")
    print(f"最小值: {df[token_col].min():,.0f}")
    print(f"标准差: {df[token_col].std():,.0f}")

# 查找准确率列
accuracy_col = None
for col in df.columns:
    if '准确' in str(col) or 'accuracy' in str(col).lower():
        accuracy_col = col
        break

print(f"\n找到准确率列: {accuracy_col}")

# 准确率统计
if accuracy_col:
    print("\n" + "=" * 80)
    print("准确率统计")
    print("=" * 80)
    # 处理准确率数据（可能是字符串格式如 "0/2"）
    if df[accuracy_col].dtype == 'object':
        # 如果是字符串格式，尝试解析
        print(f"准确率数据类型: 字符串")
        print(df[accuracy_col].value_counts())
    else:
        # 如果是数值格式
        print(f"平均准确率: {df[accuracy_col].mean():.2%}")
        print(f"最高准确率: {df[accuracy_col].max():.2%}")
        print(f"最低准确率: {df[accuracy_col].min():.2%}")

# 查找成本相关列
cost_col = None
for col in df.columns:
    col_str = str(col)
    if '成本' in col_str or 'cost' in col_str.lower() or col_str.endswith('_'):
        cost_col = col
        break

print(f"\n找到成本列: {cost_col}")

# 成本统计
if cost_col:
    print("\n" + "=" * 80)
    print("成本统计")
    print("=" * 80)
    print(f"总成本: ${df[cost_col].sum():.2f}")
    print(f"平均成本: ${df[cost_col].mean():.2f}")
    print(f"最高成本: ${df[cost_col].max():.2f}")
    print(f"最低成本: ${df[cost_col].min():.2f}")

# 数据质量分析
print("\n" + "=" * 80)
print("数据质量分析")
print("=" * 80)
print(f"总记录数: {len(df)}")
print(f"缺失值统计:")
for col in df.columns:
    missing = df[col].isna().sum()
    if missing > 0:
        print(f"  {col}: {missing} ({missing/len(df)*100:.1f}%)")

# 保存详细数据到 JSON（处理中文）
output_json = {
    'meta': {
        '生成时间': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        '数据行数': int(len(df)),
        '列数': int(len(df.columns))
    },
    'columns': df.columns.tolist(),
    'data': df.to_dict('records')
}

json_file = r'C:\Users\chenyuguang001\个人项目\代办事项web\seed_cost_data.json'
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(output_json, f, ensure_ascii=False, indent=2, default=str)

print(f"\n详细数据已保存到: {json_file}")
