<?xml version="1.0" encoding="UTF-8"?>
<!-- 
 /**
 * ====================================================================
 * About
 * ====================================================================
 * All XSLT Minesweeper
 * @version @sarissa.version@
 * @author: Copyright Sean Whalen
 * ====================================================================
 * Licence
 * ====================================================================
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 or
 * the GNU Lesser General Public License version 2.1 as published by
 * the Free Software Foundation (your choice of the two).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License or GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * or GNU Lesser General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * or visit http://www.gnu.org
 *
 */
 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <xsl:element name="SweeperMap">
      <xsl:call-template name="make-list"/>
    </xsl:element>
  </xsl:template>
  <xsl:template name="make-list">
    <xsl:param name="thisH" select="0"/>
    <xsl:param name="thisV" select="0"/>
    <xsl:variable name="vMax" select="//range/@vMax"/>
    <xsl:variable name="hMax" select="//range/@hMax"/>
    <xsl:if test="($thisV)!=$vMax">
      <xsl:call-template name="make-row">
        <xsl:with-param name="rowH" select="$thisH"/>
        <xsl:with-param name="rowV" select="$thisV"/>
        <xsl:with-param name="hMax" select="$hMax"/>
      </xsl:call-template>
      <xsl:call-template name="make-list">
        <xsl:with-param name="thisH" select="0"/>
        <xsl:with-param name="thisV" select="$thisV+1"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  <xsl:template name="make-row">
    <xsl:param name="rowH"/>
    <xsl:param name="rowV"/>
    <xsl:param name="hMax"/>
    <xsl:variable name="neighboringBombCount" select="count(//bomb[@h=$rowH +1 and @v=$rowV    ])
      +  count(//bomb[@h=$rowH +1 and @v=$rowV +1 ])        +  count(//bomb[@h=$rowH +1 and @v=$rowV
      -1 ])        +  count(//bomb[@h=$rowH -1 and @v=$rowV    ])       +  count(//bomb[@h=$rowH -1
      and @v=$rowV +1 ])        +  count(//bomb[@h=$rowH -1 and @v=$rowV -1 ])        +
      count(//bomb[@h=$rowH    and @v=$rowV -1 ])        + count(//bomb[@h=$rowH    and @v=$rowV +1
      ])          "/>
    <xsl:element name="square">
      <xsl:attribute name="h">
        <xsl:value-of select="$rowH"/>
      </xsl:attribute>
      <xsl:attribute name="v">
        <xsl:value-of select="$rowV"/>
      </xsl:attribute>
      <xsl:attribute name="sqID">
        <xsl:value-of select="$rowH"/>/<xsl:value-of select="$rowV"/>
      </xsl:attribute>
      <xsl:attribute name="isRevealed">
        <xsl:value-of select="0"/>
      </xsl:attribute>
      <xsl:attribute name="nbc">
        <xsl:value-of select="$neighboringBombCount"/>
      </xsl:attribute>
      <xsl:if test="//bomb[@h=$rowH and @v=$rowV]">
        <xsl:attribute name="isBomb">
          <xsl:value-of select="-1"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="not(//bomb[@h=$rowH and @v=$rowV])">
        <xsl:attribute name="isBomb">
          <xsl:value-of select="0"/>
        </xsl:attribute>
      </xsl:if>
    </xsl:element>
    <xsl:if test="$rowH &lt; $hMax -1">
      <xsl:call-template name="make-row">
        <xsl:with-param name="rowH" select="$rowH+1"/>
        <xsl:with-param name="rowV" select="$rowV"/>
        <xsl:with-param name="hMax" select="$hMax"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
